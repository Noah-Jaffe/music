import requests
from fake_headers import Headers
from bs4 import BeautifulSoup
import re
import os
import json
import threading
from time import time,sleep

class _ReturnableThread(threading.Thread):
    """
    Thread subclass that gives a return value of the target function when the thread gets joined.
    """
    def __init__(self, group=None, target=None, name=None, args=(), kwargs={}, Verbose=None):
        threading.Thread.__init__(self, group, target, name, args, kwargs)
        self._return = None
    def run(self):
        if self._target is not None:
            self._return = self._target(*self._args, **self._kwargs)
    def join(self, *args):
        threading.Thread.join(self, *args)
        return self._return

__DEBUG_MODE__ = None
def getEnvData() -> any:
    """
    Returns:
        any: the contents of the env.json as a python object
    """
    with open("env.json",'r',encoding='utf-8') as f:
        env = json.load(f)
    return env


def getExistingSongs(file_path:str) -> list:
    """Loads the existing songs from the given file

    Args:
        file_path (str): the file path for the json file

    Returns:
        list<dict>: a list of jsonified song objects
    """
    if not os.path.isfile(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except:
            if __DEBUG_MODE__:
                print(f"Error reading existing songs file: {file_path}")
            return []
    if __DEBUG_MODE__:
        print(f"{len(data)} songs in {file_path}")
    return data

def hashSong(song:dict):
    return ".".join([(str(song.get(k)) or '') for k in ["artist", "name"]])

def getMergedSongDb(existing:list, new:list) -> list:
    """Merge the two lists, without deleting any songs not picked up by the new list.

    Args:
        existing (list): existing song list
        new (list): the new song list

    Returns:
        list: the new song list
    """
    # is there a better way to do this that isnt O(len(nsong)*len(esong))?
    # too lazy to figure out the merge for now, so just add each as new lol?
    brand_new_songs = []
    for n in new:
        nsrc = set(n.get('src',[]))
        found_existing = False
        for e in existing:
            esrc = set(e.get('src',[]))
            matching_srcs = esrc & nsrc
            if matching_srcs:
                e['src'] = list(nsrc | esrc)
                found_existing = True
                break
        if not found_existing:
            brand_new_songs.append(n)
    return existing + brand_new_songs

######################
# CODE TO FIND SONGS #
######################
def generateSongListFromFilters(filters:list) -> list:
    """generates song list

    Args:
        filters (list): list of filter objects

    Returns:
        list: list of song objects
    """
    children = []
    all_songs = []
    for f in filters:
        source = f.get("source")
        generatorFunc = None
        if source == "mixcloud":
            generatorFunc = generateFromMixcloud
        elif source == "podomatic":
            generatorFunc = generateFromPodomatic
        # TODO: NEW SOURCES HERE
        
        if generatorFunc:
            child = _ReturnableThread(target=generatorFunc, args=(f,))
            children.append(child)
            child.start()

    for child in children:
        song_list = child.join()
        all_songs += song_list
    return all_songs


####### MIXCLOUD ########
def generateFromMixcloud(fltr):
    # TODO: update this func when new keys are introduced when SONG_FILTERS->"source" == "mixcloud"
    dj = fltr.get("name")
    songs = []
    if fltr.get("slugKeys"):
        for key in fltr["slugKeys"]:
            songs.append(getSongFromMixcloudSlug(f"{dj}/{key}"))
    else:
        songs += retreive_all_mixcloud_songs_from_artist(dj, fltr.get("songNameRegex"))
    return songs

def retreive_all_mixcloud_songs_from_artist(name, song_regex) -> list:
    """Gets a list of songs by the artist info from their mixcloud source.

    Args:
        nickname (str): the artist nickname
        artist_info (dict): the artist info dict

    Returns:
        list: list of dicts representing song like objects
    """
    children = []
    song_list = []
    session = requests.Session()
    session.headers.update(Headers(browser="chrome").generate())
    queue = [f"https://api.mixcloud.com/{name}/cloudcasts/?limit=100&metadata=1"]
    while queue:
        url = queue.pop()
        result = session.get(url).json()
        # add next url to queue if needed
        next_url = result.get('paging',{}).get('next')
        if next_url:
            queue.append(next_url)
        # retreive the songs
        new_thread = _ReturnableThread(target=_getMixcloudSrcUrls, args=(result.get('data', []), song_regex))
        new_thread.start()
        children.append(new_thread)
        
    for child in children:
        result = child.join()
        song_list += result
        
    # TODO: normalize song names?
    return song_list

def _getMixcloudSrcUrls(records:list, song_regex) -> list:
    """Gets the songs data including the src urls for the records

    Args:
        records (list): list of dict where dict is raw return value of mixcloud api request.
        nickname (str): the artist nickname
        artist_info (dict): the artist info dict

    Returns:
        list: _description_
    """
    song_list = []
    for record in records:
        if song_regex:
            if not re.match(song_regex, record.get("name"), re.IGNORECASE|re.MULTILINE):
                continue
        song = mixcloudJsonToSong(record)
        song['thread'] = _ReturnableThread(target=_getMixcloudSrcUrl, args=(f"https://mixcloud.com{song['_uid']}",))
        song['thread'].start()

        song_list.append(song)
    
    for i in range(len(song_list)):
        result = song_list[i]['thread'].join()
        if result == None:
            # retry here
            sleep(.2)
            result = _getMixcloudSrcUrl(f"https://mixcloud.com{song_list[i]['_uid']}")
        song_list[i]['src'].append(result)
        del song_list[i]['thread']
    
    return song_list

last_mixclouddownloader_req = 0
def _getMixcloudSrcUrl(mixcloud_url:str) -> str:
    """Queries DL_MIXCLOUD_URL to get the source url of the given mixcloud url.

    Args:
        mixcloud_url (str): the mixcloud song url

    Returns:
        str: the source string
    """
    DL_MIXCLOUD_URL = "https://mixclouddownloader.net/"
    session = requests.Session()
    session.headers.update(Headers(browser="chrome").generate())
    session.headers["Referer"] = DL_MIXCLOUD_URL

    try:
        while (time() - last_mixclouddownloader_req < 1):
            # waiting for next available requst to be sent
            pass
        response = session.get(DL_MIXCLOUD_URL, timeout=10000)
    except:
        print(f"ERROR: unable to connect to {DL_MIXCLOUD_URL} when looking for {mixcloud_url}, try again later!")
        return
    soup = BeautifulSoup(response.text, 'html.parser')
    form_inputs = {
        input_tag['name']: input_tag.get('value', '')
        for input_tag in soup.select('form input')
    }
    form_inputs['mix-url'] = mixcloud_url
    session.headers["Accept"]= "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
    session.headers["Accept-Language"] = "en-US,en;q=0.5"
    session.headers["Content-Type"] = "application/x-www-form-urlencoded"
    session.headers["Upgrade-Insecure-Requests"] = "1"
    session.headers["Sec-Fetch-Dest"] = "document"
    session.headers["Sec-Fetch-Mode"] = "navigate"
    session.headers["Sec-Fetch-Site"] = "same-origin"
    session.headers["Sec-Fetch-User"] = "?1"

    response2 = session.post(DL_MIXCLOUD_URL + "/download-track", data=form_inputs)
    resulting_html = response2.text

    soup = BeautifulSoup(resulting_html, "html.parser")
    for a in soup.find_all("a"):
        if a.text.strip().lower() == "download link":
            if __DEBUG_MODE__:
                print(f"{mixcloud_url}'s download link is {a.get('href')}")
            return a.get("href")
    if __DEBUG_MODE__:
        print(f"WARNING: No download link found for {mixcloud_url}")
    return None

def getSongFromMixcloudSlug(mixcloud_key):
    session = requests.Session()
    session.headers.update(Headers(browser="chrome").generate())
    response = session.get(f"https://api.mixcloud.com/{mixcloud_key}").json()
    song = mixcloudJsonToSong(response)
    song['src'] = []
    song['src'].append(_getMixcloudSrcUrl(response['url']))
    return song

def mixcloudJsonToSong(record):
    song = {}   # name, artist, tags, thumb, src
    song['artist'] = record.get("user",{}).get("name")
    song['name'] = record.get("name")
    song['tags'] = [x['name'] for x in record.get("tags")]
    song['thumb'] = record.get("pictures",{}).get('large')
    song['_uid'] = record.get('key')
    song['src'] = []
    return song
##########################

####### PODOMATIC ########
def generateFromPodomatic(fltr):
    # TODO: update this func when new keys are introduced when SONG_FILTERS->"source" == "podomatic"
    songs = []
    songs += retreive_podomatic_songs_from_artist(fltr.get("name"), fltr.get("songNameRegex"), fltr.get("apiUserId"))
    return songs

def retreive_podomatic_songs_from_artist(name, song_regex, api_user_id) -> list:
    """Gets a list of songs by the artist info from their podomatic source.

    Returns:
        list: list of dicts representing song like objects
    """
    song_list = []
    session = requests.Session()
    session.headers.update(Headers(browser="chrome").generate())

    url = f"https://www.podomatic.com/v2/podcasts/{api_user_id}/episodes?per_page=12&page=1"
    result = session.get(url).json()
    sleep(0.3)
    queue = [f"https://www.podomatic.com/v2/podcasts/{api_user_id}/episodes?per_page=12&page={i}" for i in range(1, result.get("pagination",{}).get("page_count") + 1)]
    while queue:
        url = queue.pop()
        result = session.get(url).json()
        sleep(0.3)
        for record in result.get("episodes"):
            if song_regex:
                if not re.match(song_regex, record.get("title"), re.IGNORECASE|re.MULTILINE):
                    continue
            song = podomaticJsonToSong(record)
            song_list.append(song)
    
    return song_list

def podomaticJsonToSong(record):
    song={}
    song['name'] = record.get("title")
    song['artist'] = record.get('profile',{}).get('profile_name')
    song['_uid']=f"{song['artist']}/{song['name']}"
    song['tags'] = set()
    if record.get('category',{}).get('category_name'):
        song['tags'].add(record.get('category',{}).get('category_name'))
    if record.get('genre',{}).get('category_name'):
        song['tags'].add(record.get('category',{}).get('category_name'))
    song['tags'] = list(song['tags'])
    song['thumb'] = record.get("image_url")
    song['src'] = []
    for srcKey in ['permalink_url', 'download_media_url', 'media_url']:
        if record.get(srcKey):
            song['src'].append(record.get(srcKey))
    return song
##########################

def main():
    global __DEBUG_MODE__
    start = time()
    # load env vars
    env = getEnvData()
    __DEBUG_MODE__ = env.get("__DEBUG_MODE__")
    print(f"DEBUG MODE IS: {'in' if not __DEBUG_MODE__ else ''}active")
    # default to songs.json if it was never setup
    songs_file_path = f'{os.getcwd()}/{env.get("SONGS_FILE_PATH","songs.json")}'
    
    # find any updates needed
    #new_songs_db = generateSongListByArtist(env.get("BY_ARTISTS", {}))
    new_songs_db = generateSongListFromFilters(env.get("SONG_FILTERS", []))
    songs_db = getExistingSongs(songs_file_path)

    # merge in the songs that we havent seen yet
    songs_db = getMergedSongDb(existing=songs_db, new=new_songs_db)
    elapsed = time()-start
    print(f"TOOK {elapsed} SEC TO RUN")
    if songs_db:
        with open(songs_file_path,'w',encoding='utf-8') as f:
            json.dump(songs_db, indent=2, fp=f)
        print("UPDATED!")
    else:
        print("No updates needed!")


if __name__ == "__main__":
    main()