## this needs to be updated to write to songs.json
import requests
from bs4 import BeautifulSoup
import re
import csv
import os
import json

SONG_PATH = os.path.abspath(os.getcwd()) + "/songs.csv"
EXISTING_SONGS_PATH = os.path.abspath(os.getcwd()) + "/songs.js"

def getExistingSongs():
    with open(EXISTING_SONGS_PATH, 'r', encoding='utf-8') as f:
        data = f.read()
        # remove js compatablility garbage
        data = data[data.find("["):]
    return data


def getMixcloudSrcUrl(mixcloud_url):
    DL_MIXCLOUD_URL = "https://mixclouddownloader.net/"
    session = requests.Session()
    response = session.get(DL_MIXCLOUD_URL)
    soup = BeautifulSoup(response.text, 'html.parser')
    form_inputs = {
        input_tag['name']: input_tag.get('value', '')
        for input_tag in soup.select('form input')
    }
    form_inputs['mix-url'] = mixcloud_url
    headers = {
        "Referer": DL_MIXCLOUD_URL,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Apple WebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari",
    }
    response = session.post(DL_MIXCLOUD_URL + "/download-track", data=form_inputs, headers=headers)
    resulting_html = response.text

    soup = BeautifulSoup(resulting_html, "html.parser")
    for a in soup.find_all("a"):
        if a.text.strip().lower() == "download link":
            return a.get("href")
    return None

def formatMixcloudUrlForMusicPlayer(src_url):
    try:
        return re.sub(r"(https://stream)(\d+)(\.mixcloud\.com/secure/c/m4a/64/.*$)", "\\1\\\\t#\\\\t\\3", src_url, 0, re.MULTILINE|re.IGNORECASE)
    except:
        return src_url

def updateSongSrcs(songDbFile):
    db = list(csv.reader(open(songDbFile, 'rb'), delimiter='\t'))
    db ={k:row[i] for row in db[1:] for i, k in enumerate(db[0]) }
    updates = 0
    for row in db:
        if row['srctype'] == "mixcloud" and not row['SRCURL']:
            src = getMixcloudSrcUrl(f"https://mixcloud.com{row['KEY']}")
            if src:
                row['SRCURL'] = formatMixcloudUrlForMusicPlayer(src)
                updates += 1
                print(row['KEY'], row['SRCURL'])
    if updates:
        print(f"{updates} new srcs found!")
    # TODO: commit changes?
          
        

def generateSongList(): 
    """
    Runs all of the song generator functions. 
    RETURNS:
        list<dict> jsonlike data for the songs.
    """
    pass
    # TODO: generate new song list via this func.
    # TODO: update song list file if needed

if __name__ == "__main__":
    updateSongSrcs(SONG_PATH)
