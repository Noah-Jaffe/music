/** Generic-ish functions used throughout the app.
 * Interact with internet
 * Formatting values
 * etc...
 */
class Util {
  /**Fetches the response from the URL. If offline, it will attempt to wait for up to `max_attempts=10` tries, 1 minutes each, for the connection to go back online.
   * @param url <String> the url to get.
   * @param max_attempts <int> the number of times to attempt before aborting.
   * @throws Exceptions that are raised while fetching the url (not including NetworkErrors), or an offline timeout error.
   */
  static async get_successful_fetch(url, max_attempts = 10) {
    function delay_until_connection(timeout_sec) {
      // Sleep until onLine or timeout.
      var end_at = Date.now() + timeout_sec * 1000;
      while (!window.navigator.onLine) {
        if (Date.now() >= end_at) {
          throw "Timeout exception, offline for too long!";
        }
      }
    }
    var attempt = 0;
    var result = null;
    while (result == null && attempt++ < max_attempts) {
      try {
        return await fetch(url);
      } catch (err) {
        if (!err.message.startsWith("NetworkError")) {
          throw err;
        }
        // else it is a network error, so keep waiting until we timeout in 60 seconds
        Logger.log(
          `get_successful_fetch(${url}); //Offline... waiting to reconnect...`,
          65
        );
        await delay_until_connection(60);
      }
    }
    throw `Timed out trying to get ${url}`;
  }
  /**Extracts json from a successful fetch.
   * @param url <String> The url to extract JSON from.
   * @returns result of JSON.parse.
   */
  static async get_JSON(url) {
    Logger.log(`get_JSON(${url})`, 10);
    var response = await get_successful_fetch(url);
    var data = await response.json();
    Logger.log(data, 10);
    return data;
  }
  /** converts numeric to human readable timestamp d h s.ms
   *  @param sec <number> seconds.
   * @returns <String> simplified timestamp.
   */
  static sec_to_human_readable_timestamp(sec) {
    return `${String(parseInt(sec / 3600)).padStart(2, "0")}:${String(
      parseInt((sec % 3600) / 60)
    ).padStart(2, "0")}:${parseInt(sec) % 60}`;
  }
  /** attempts to detect if using a mobile device/mode
   * @returns true if on mobile device, false otherwise.
   */
  static mobileCheck() {
    return (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        navigator.userAgent || navigator.vendor || window.opera
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        (navigator.userAgent || navigator?.vendor || window.opera).substr(0, 4)
      )
    );
  }

  /**
   * dynamic purejs way of loading an external src script
   * Used for:
   * - To fetch/load the SongsDb from songs.js, if songs.json is unreachable.
   * - For dynamically fetching the appropriate subset of srcs for the webpage visuals.
   * @param {*} FILE_URL 
   */
  static loadJS(FILE_URL) {
    var scriptEle = document.createElement("script");
  
    scriptEle.setAttribute("src", FILE_URL);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", false);
  
    document.body.appendChild(scriptEle);
  
    // success event 
    scriptEle.addEventListener("load", () => {
      Logger.log(`Loaded ${FILE_URL}`, 2);
    });
     // error event
    scriptEle.addEventListener("error", (ev) => {
      Logger.log(`Error loading ${FILE_URL}`, 2);
      console.error(ev);
    });
  }
}

/** Logging system to console and table on page. Expects one logger table to exist per static scope.*/
class Logger {
  static #loggerContainer;
  static #loggerContainerId = "__LOGGER_CONTAINER__";
  static #loggerContainerTableId = "__LOGGER_CONTAINER_TABLE__";

  static setupLogger(elementToAttachTo) {
    window.alert(elementToAttachTo); // debug
    this.attachLoggerTable(elementToAttachTo);
    this.attachLoggerStyleSheet();
  }

  /** Attaches an HTML table for logging to the given element.
   * NOTE: not really needed if the table is hardcoded in the HTML
   * @param {HTMLElement} elementToAttachTo the element to add the table as a child to. If none given will default to body element.
   */
  static attachLoggerTable(elementToAttachTo) {
    if (!elementToAttachTo) {
      // if no element given, use the body
      elementToAttachTo = document.querySelector("body");
      if (!elementToAttachTo) {
        // if no body (???) then create one.
        elementToAttachTo = document.createElement("body");
        document.appendChild(elementToAttachTo);
      }
    }
    var table = document.createElement("table");
    var thead = document.createElement("thead");
    table.appendChild(thead);
    var tr = document.createElement("tr");
    thead.appendChild(tr);
    ["Timestamp", "Message"].forEach((h) => {
      var th = document.createElement("th");
      th.appendChild(document.createTextNode(h));
      tr.appendChild(th);
    });
    var tbody = document.createElement("tbody");
    tbody.setAttribute("id", this.#loggerContainerTableId);
    table.appendChild(tbody);
    if (
      this.loggerContainer ??
      document.getElementById(this.#loggerContainerId)
    ) {
      this.loggerContainer.remove();
      this.loggerContainer = null;
    }
    table.setAttribute("id", this.#loggerContainerId);
    elementToAttachTo.appendChild(table);
    this.loggerContainer = table;
  }

  /**
   * @param {CSSStyleSheet} styleSheet the style sheet, or the style tag to attach our rules to. If none given, it will add a new styleSheet to the document.
   */
  static attachLoggerStyleSheet() {
    var styleSheet = document.querySelector("style");
    if (!styleSheet) {
      styleSheet = document.createElement("style");
      document.appendChild(styleSheet);
    }
    const styles = `\n#${this.#loggerContainerId}:has(#${this.#loggerContainerTableId}:empty) { display: none; } /* The :has modifier does not work in firefox just yet. */\n#${this.#loggerContainerId} { font-size:10pt; word-wrap:break-word; font-family: Consolas, monaco, monospace; }`
    styleSheet.innerHTML = styleSheet.innerHTML + styles;
  }

  /**Writes data to the log table at the bottom of the page
   * @param {*} val the value to write
   * @param {Number} timeout the seconds before the log message is destroyed, <=0 for no distruction.
   */
  static log(val, timeout = 0) {
    console.log(val);
    var tbl =
      this.loggerContainer ??
      document.getElementById(this.loggerContainerTableId);
    if (!tbl) {
      return;
    }
    var ts = document.createTextNode(
      new Date().toLocaleTimeString("en-us", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      })
    );
    var is_secondary_val_type = false;
    if (String(val) == "[object Object]") {
      val = JSON.stringify(val);
      is_secondary_val_type = true; //JSON.parse(JSON.stringify(val)) == val;
    }
    val = document.createTextNode(val);
    var newRow = document.createElement("tr");
    newRow.appendChild(document.createElement("td")).appendChild(ts);
    newRow.appendChild(document.createElement("td")).appendChild(val);
    if (is_secondary_val_type) {
      newRow.childNodes[1].style.color = "red";
    }

    tbl.appendChild(newRow);
    tbl.hidden = false;
    if (timeout > 0) {
      this.#removeFadeOutAfter(newRow, Math.max(timeout, 1));
    }
  }
  /** Fades an element after a given time, and deletes the object from the DOM/memory.
   * @param {HTMLElement} el the element to be dissapered
   * @param {*} seconds the seconds to dissapear after
   */
  static async #removeFadeOutAfter(el, seconds) {
    setTimeout(() => {
      el.style.transition = "opacity 1s ease";
      el.style.opacity = 0;
      setTimeout(function () {
        el.parentNode.removeChild(el);
      }, seconds * 1000);
    }, Math.max(seconds - 1, 1) * 1000);
  }
}

class PersistentData {
  /**
   * Updates the given data as stringified JSON for the given key in the `localStorage`.
   * @param key <str> the localStorage key to update
   * @param data <?> the data.
   * @param mode <int>, -1=delete, 0=overwrite, 1=append (if [existing type is array, and mode == 1])
   */
  static update(key, data = null, mode = 0) {
    if (key == null) {
      return key;
    }
    key = key.toString().startsWith(window.location.pathname)
      ? key.toString()
      : `${window.location.pathname}.${key.toString()}`;
    if (mode in [-1, 0]) {
      localStorage.removeItem(key);
    }
    if (mode in [0, 1] && data != null) {
      var temp = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(temp)) {
        temp = temp.concat(data);
      } else {
        temp = data;
      }
      localStorage.setItem(key, JSON.stringify(temp));
    }
  }

  /**
   * @returns JSON.parse of the value stored at the `localStorage.key`.
   * null if it does not exist.
   * SECURITY NOTE: if attackers are able to override the values stored in the localstorage field, then they could possibly execute arbitrary code.
   */
  static load(key) {
    if (key == null) {
      return key;
    }
    return JSON.parse(
      localStorage.getItem(
        key.toString().startsWith(window.location.pathname)
          ? key.toString()
          : `${window.location.pathname}.${key.toString()}`
      )
    );
  }
}

class MediaSessionControls {
  #audioElement = null;
  #default_skip_time = 60;

  /**
   * Binds all the neccessary action handlers.
   */
  constructor() {
    if (!this.#audioElement) {
      this.#audioElement = document.querySelector("audio");
    }
    if (!("mediaSession" in navigator)) {
      Logger.log(`No mediaSession in navigator?`, 0);
    }
    const action_handlers = [
      ["play", this.play],
      ["pause", this.pause],
      ["stop", this.stop],
      ["previoustrack", this.previoustrack],
      ["nexttrack", this.nexttrack],
      ["seekbackward", this.seekbackward],
      ["seekforward", this.seekforward],
      ["seekto", this.seekto],
      ["togglemicrophone", this.togglemicrophone],
      ["togglecamera", this.togglecamera],
      ["hangup", this.hangup],
      ["previousslide", this.previousslide],
      ["nextslide", this.nextslide],
    ];
    for (const [action, handler] of action_handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        Logger.log(`Failed to set navigator.mediaSession ActionHandler of ${action}.`, 2);
      }
    }
    try {
      // Set playback event listeners
      this.#audioElement.addEventListener("play", () => {
        navigator.mediaSession.playbackState = "playing";
      });
      this.#audioElement.addEventListener("pause", () => {
        navigator.mediaSession.playbackState = "paused";
      });
    } catch (err) {
      Logger.log(
        `Failed to set navigator.mediaSession.playbackState play/pause handlers`,
        0
      );
    }
  }

  // The action handler activities
  play() {
    Logger.log("play +");
    this.#audioElement.play();
    Logger.log("play -");
  }
  pause() {
    Logger.log("pause +");
    this.#audioElement.pause();
    Logger.log("pause -");
  }
  stop() {
    Logger.log("stop +");
    this.#audioElement.pause();
    Logger.log("stop -");
  }
  previoustrack() {
    Logger.log("previoustrack +");
    if (this.#audioElement.currentTime > 5) {
      audioElement.currentTime = 0;
    } else {
      Logger.log("// TODO `previoustrack` needs to play previous!", 0);
    }
    Logger.log("previoustrack -");
  }
  nexttrack() {
    Logger.log("nexttrack +");
    Logger.log("// TODO `nexttrack` needs to go to next track!", 0);
    Logger.log("nexttrack -");
  }
  seekbackward() {
    Logger.log("seekbackward +");
    const skip_time = arguments.seekOffset || this.#default_skip_time;
    this.#audioElement.currentTime = Math.max(
      this.#audioElement?.currentTime - skip_time,
      0
    );
    navigator.mediaSession.setPositionState({
      duration: this.#audioElement?.duration,
      playbackRate: this.#audioElement?.playbackRate,
      position: this.#audioElement?.currentTime,
    });
    Logger.log("seekbackward -");
  }
  seekforward() {
    Logger.log("seekforward +");
    const skip_time = arguments.seekOffset || this.#default_skip_time;
    this.#audioElement.currentTime = Math.min(
      this.#audioElement?.currentTime + skip_time,
      0
    );
    navigator.mediaSession.setPositionState({
      duration: this.#audioElement?.duration,
      playbackRate: this.#audioElement?.playbackRate,
      position: this.#audioElement?.currentTime,
    });
    Logger.log("seekforward -");
  }
  seekto() {
    Logger.log("seekto +");
    if (arguments.fastSeek && "fastSeek" in this.#audioElement) {
      this.#audioElement.fastSeek(arguments.seekTime);
    } else {
      this.#audioElement.currentTime = arguments.seekTime;
    }
    navigator.mediaSession.setPositionState({
      duration: this.#audioElement.duration,
      playbackRate: this.#audioElement.playbackRate,
      position: arguments.seekTime,
    });
    Logger.log("seekto -");
  }
  togglemicrophone() {
    this._notImplemented(arguments.callee.name);
  }
  togglecamera() {
    this._notImplemented(arguments.callee.name);
  }
  hangup() {
    if (this.#audioElement?.currentTime > 0) {
      this.#audioElement.play();
    }
  }
  previousslide() {
    this._notImplemented(arguments.callee.name);
  }
  nextslide() {
    this._notImplemented(arguments.callee.name);
  }
  #_notImplemented(name) {
    var err = new Error(
      `Warning: MediaSessionControls.${name} has not been implemented!`
    );
    Logger.log(err.stack, 0);
  }
}

class SwipeControls {
  /** Sets up controls/listeners to the given touchsurface
   * @param {HTMLElement | null} touchsurface The touch surface to listen for swipes. If null, is set to document.body.
   * @param {Number} threshold required min distance traveled to be considered swipe
   * @param {Number} restraint maximum distance allowed at the same time in perpendicular direction
   * @param {Number} allowedTime maximum time allowed to travel that distance
   */
  static setup(
    touchsurface = null,
    threshold = 50,
    restraint = 100,
    allowedTime = 300
  ) {
    var touchsurface = touchsurface,
      swipedir,
      startX,
      startY,
      distX,
      distY,
      threshold = threshold,
      restraint = restraint,
      allowedTime = allowedTime,
      elapsedTime,
      startTime;

    touchsurface.addEventListener(
      "touchstart",
      function (e) {
        var touchobj = e.changedTouches[0];
        swipedir = "none";
        dist = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
        startTime = new Date().getTime(); // record time when finger first makes contact with surface
        e.preventDefault();
      },
      false
    );
    // prevent scrolling when inside touchsurface
    touchsurface.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      false
    );
    touchsurface.addEventListener(
      "touchend",
      function (e) {
        var touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX; // get horizontal dist traveled while in contact with surface
        distY = touchobj.pageY - startY; // get vertical dist traveled while in contact with surface
        elapsedTime = new Date().getTime() - startTime; // get time elapsed
        var direction = "";
        if (elapsedTime <= allowedTime) {
          // first condition for swipe met
          var dirin360 = Math.atan2(
            startX * touchobj.pageY - startY * touchobj.pageX,
            startX * touchobj.pageX + startY * touchobj.pageY
          );
          Logger.log(`Swiped in angle of ${dirin360}`, 0);
          if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
            // 2nd condition for horizontal swipe met
            swipedir = distX < 0 ? "left" : "right"; // if dist traveled is negative, it indicates left swipe
          } else if (
            Math.abs(distY) >= threshold &&
            Math.abs(distX) <= restraint
          ) {
            // 2nd condition for vertical swipe met
            swipedir = distY < 0 ? "up" : "down"; // if dist traveled is negative, it indicates up swipe
          }
          Logger.log(`Swiped in dir of ${swipedir}`);
          SwipeControls.handleswipe360(dirin360);
        }
        e.preventDefault();
      },
      false
    );
  }

  /** Swipe handler.
   * @param {Number} angle (0 to 360?) Todo figure out what the fuck this does
   */
  static handleswipe360(angle) {
    // TODO: Figure out how to calculate the cardinal direction for the given angle and then execute the expected action
    Logger.log(angle, 1);
  }
}

/**
 * class is useful for debugging during development.
 */
class DEBUG {
  static listAllEventListeners() {
    const allElements = Array.prototype.slice.call(
      document.querySelectorAll("*")
    );
    allElements.push(document);
    allElements.push(window);

    const types = [];

    for (var ev in window) {
      if (/^on/.test(ev)) types[types.length] = ev;
    }

    var elements = [];
    for (var i = 0; i < allElements.length; i++) {
      const currentElement = allElements[i];
      for (var j = 0; j < types.length; j++) {
        if (typeof currentElement[types[j]] === "function") {
          elements.push({
            node: currentElement,
            type: types[j],
            func: currentElement[types[j]].toString(),
          });
        }
      }
    }

    console.table(
      elements.sort(function (a, b) {
        return a.type.localeCompare(b.type);
      })
    );
  }

  static listAllPersistentData() {
    Logger.log(localStorage, 60)
  }
}


class SongView {
  /**
   * Generates a music selector table from the given song db data.
   * @param {Array[song]} songdb the song array (from the songs.json/songs.js)
   * @returns <table>
   */
  static getTableFromSongDb(songdb, uid = null) {
    var uid = uid ?? crypto.randomUUID().replace("-","");
    var table = document.createElement("table");
    table.setAttribute("id",`table_${uid}`);
    var thead = document.createElement("thead");
    thead.setAttribute("id",`thead_${uid}`);
    thead.appendChild(this.getHeaderRow());
    table.appendChild(thead);
    var tbody = document.createElement("tbody");
    tbody.setAttribute("id",`tbody_${uid}`);
    if (Array.isArray(songdb)) {
      songdb.forEach(song => {
        tbody.appendChild(this.getDataRowFromSong(song));
      });
    }
    table.appendChild(tbody);
    return table;
  }

  /**
   * Gets the header row for the song view table.
   * Columns:
   *  - Checkbox (onclick == checkboxHeaderOnChange)
   *  - Name (onclick == headerTextCellonClick)
   *  - Title (onclick == headerTextCellonClick)
   *  - Tags (onclick == tagsHeaderOnClick)
   * @returns <tr>
   */
  static getHeaderRow() {
    var tr = document.createElement("tr");
    tr.classList.add("headerRow");
    var checkbox = this.#getCheckboxCell();
    checkbox.onchange = this.#checkboxHeaderOnChange;
    tr.appendChild(checkbox);
    var name = this.#getTextCell("Name");
    name.setAttribute("idx",1);
    name.onclick = this.#headerTextCellonClick;
    tr.appendChild(name);
    var title = this.#getTextCell("Title");
    title.setAttribute("idx",2);
    title.onclick = this.#headerTextCellonClick;
    tr.appendChild(title);
    var tags = this.#getTextCell("Tags");
    tags.onclick = this.#tagsHeaderOnClick;
    tr.appendChild(tags);
    return tr;
  }
  /**
   * Gets the table row for a given song object blurb.
   * @param {object} song the song object
   * @returns <tr>
   */
  static getDataRowFromSong(song) {
    var tr = document.createElement("tr");
    tr.classList.add("songRow");
    tr.appendChild(this.#getCheckboxCell());
    tr.appendChild(this.#getTextCell(song.artist));
    tr.appendChild(this.#getTextCell(song.name));
    tr.appendChild(this.#getTagsCell(song.tags));
    return tr;
  }
  
  /**
   * Gets a checkbox cell. Defaults to unchecked.
   * @param {boolean} checked boolean for checked or not
   * @returns <td> element.
   */
  static #getCheckboxCell(checked=false){
    var td = document.createElement("td");
    td.classList.add("xC");
    var checkbox = document.createElement("input");
    checkbox.setAttribute("type","checkbox");
    if (checked) {
      checkbox.checked = true;
    }
    td.appendChild(checkbox);
    return td;
  }

  /**
   * Gets the formatted cell with the given text.
   * @param {string} txt the text to add
   * @returns <td> element.
   */
  static #getTextCell(txt){
    var td = document.createElement("td");
    td.classList.add("tC");
    td.appendChild(document.createTextNode(txt));
    return td;
  }

  /**
   * Gets the formatted cell with the given list of tags.
   * @param {Array[string]} tags list of tags
   * @returns <td> element.
   */
  static #getTagsCell(tags){
    var td = document.createElement("td");
    td.classList.add("lC");
    var ul = document.createElement("ul");
    if (Array.isArray(tags)) {
      tags.forEach(tag=>{
        var li = document.createElement("li");
        var txt = document.createTextNode(tag);
        li.appendChild(txt);
        ul.appendChild(li);
      });
    }
    td.appendChild(ul);
    return td;
  }
  
  static #headerTextCellonClick(event) {
    var src = event.target;
    const modeMap = {
      '⬇️':'⬆️',
      '⬆️':undefined,
      undefined:'⬇️',
      '':'⬇️'
    }
    var currentMode = src.attributes["sorted_mode"]?.nodeValue;
    var nextMode = modeMap[currentMode];
    // update title text
    if (currentMode) {
      src.innerText = src.innerText.replace(currentMode, nextMode || '');
    } else {
      src.innerText = `${src.innerText.trim()} ${nextMode}`;
    }
    // update attribute
    src.setAttribute("sorted_mode",nextMode || '');
    // do the sorting
    var node = src;
    while (!node.id) {
      node = node.parentNode;
    }
    var uid = node.id.split("_",2)[1];
    SongView.#sortTableBodyByIdx(uid, parseInt(src.attributes['idx'].nodeValue), nextMode);

  }

  static #sortTableBodyByIdx(tableId, columnIndex, order) {
    if (!(['⬇️','⬆️'].includes(order))) {
      return;
    }
    var tbody = document.querySelector(`#tbody_${tableId}`);
    if (!tbody) {
      return;
    }
    var rows = tbody.querySelectorAll("tr");
    function compareColVal(row1,row2) {
      if (order == '⬇️') {
        return row1.children[columnIndex].innerText > row2.children[columnIndex].innerText;
      } else {
        return row1.children[columnIndex].innerText < row2.children[columnIndex].innerText;
      }
      
    }
    tbody.replaceChildren();
    Array.from(rows).sort(compareColVal).forEach(row=>{
      tbody.appendChild(row);
    })
    
  }

  static #tagsHeaderOnClick(event) {

  }
  /**
   * Handles action when a checkbox header is changed. 
   * TODO: figure out what we want to do later.
   * @param {event} change 
   */
  static #checkboxHeaderOnChange(change) {
    if (change.target.checked) {
      // todo: what to do when it is checked
      Logger.log("checkbox header was checked!",1)
    } else {
      // todo what to do when it is unchecked
      Logger.log("checkbox header was unchecked!",1)
    }
  }

  static attachStyleSheet() {
    var styleSheet = document.querySelector("style");
    if (!styleSheet) {
      styleSheet = document.createElement("style");
      document.appendChild(styleSheet);
    }
    const styles = [
      // todo: add styles here:
      `thead.headerRow {}`
      `td.xC {}`,
      `td.tC {}`,
      `td.lC {}`,
    ];
    styleSheet.innerHTML = styleSheet.innerHTML + styles.join("\n");
  }
}

class Song {
  constructor(artist, name, srcs=[], thumb=null, tags=[], _uid=null) {
      this.artist = artist;
      this.name = name;
      this.tags = tags;
      this.thumb = thumb;
      if (!Array.isArray(srcs) || srcs.length == 0) {
        Logger.log(`Error, bad song! Requires at least one src in the srcs array!`);
        throw Error(`Error, bad song! Requires at least one src in the srcs array!`);
      }
      this.srcs = srcs;
      this._uid = _uid ?? `${artist}/${name}`;

  }

  getName(){ return this.name; }
  getArtist() { return this.artist; }
  getHash() { return this._uid; }
  
  /**
   * @returns array of <source> from this song's srcs.
   */
  getSourcesElements() {
    return this.srcs.map(e=> {
      var src = document.createElement("source");
      src.setAttribute("src", e);
      return src;
    });
  }
}
class AudioPlayer{
  #playOrderModeKeys = [
    '🔀',
    '🔃',
    '🔂',
    // '🔁',
    // '🔄'
  ];

  constructor(songlist=null) {
    this.uid = crypto.randomUUID().replace("-","");

    // controls
    this.player = this.#generateAudioElement();
    this.orderMode = this.#generatePlayOrderModeButton();
    this.skip = this.#generateSkipButton();
    this.markTimestamp = this.#generateMarkTimestampButton();
    this.muteToggle = this.#generateToggleMuteButton();
    this.ban = this.#generateBanButton();
    this.songSelector = this.#generateSongSelector();

    // internal usage data
    this.playerHistory = [];
    this.banList = new Set();
    this.currentSong = null;
    this.songlist = [];
  }

  

  /**
   * Bans the given song from being played again, if it is currently playing it will call skipCurrentSong
   * @param {Song} song song to ban (by .hash)
   */
  banSong(song) {
    if (song instanceof Song) {
      this.banList.add(song.getHash());
      Logger.log(`Added to banlist: ${song.getName()} by ${song.getArtist()}`);
    }
    if (this.currentSong == song) {
      this.goNextSong();
    }
  }

  /**
   * This func takes care of the logic for which song should be loaded next.
   * Filters out recently played, banned songs, or songs not in the current playlist.
   * Calls #loadSongIntoPlayer with the new song to play.
   */
  goNextSong() {
    if (!this.currentSong) {
      Logger.log("Not currently playing anything, was this intentional?",0)
    }
    var currentModeKey = this.orderMode.textContent;
    var nextSong = null;
    if (currentModeKey == '🔂') {
      // REPEAT
      nextSong = this.currentSong;
    } else {
      Logger.log(`need to implement logic for getting next song when mode is ${currentModeKey}`);
    }
    
    if (nextSong == null) {
      Logger.log("nextSong should not be null when you get to this point, aborting goNextSong")
      return;
    }

    this.#loadSongIntoPlayer(nextSong);
  }

  /**
   * Action for when you want to mark the timestamp from the current song.
   */
  markCurrentTimestamp() {
    var currentTime = this.player.currentTime;
    if (this.currentSong && currentTime) {
      this.currentSong.add(currentTime);
      Logger.log(`Marked timestamp for ${this.currentSong.getName()} by ${this.currentSong.getArtist()} at ${Util.sec_to_human_readable_timestamp(currentTime)}`);
    }
  }

  /**
   * Adds a song to the internal list of songs.
   * @argument {*} any, dynamic number of arguments, where each argument is a 
   * json object representing a song, or a song object itself.
   */
  addSong() {
    var songHashes = new Set(this.songlist.map(e=>e.getHash()));
    for (var arg of arguments) {
      var songToAdd = null;
      if (arg instanceof Song) {
        songToAdd = arg;
      } else {
        try {
          songToAdd = new Song(arg);
        } catch {
          Logger.log(`Unable to convert ${arg} to a song!`,3)
        }
      }
    }
    if (songToAdd) {
      // add the song if it is not already in the list.
      var songHash = songToAdd.getHash()
      if (! songHashes.has(songHash)) {
        this.songlist.push(songToAdd);
        songHashes.add(songHash);
      }
    }
    this.updateSongListVisuals();
  }

  /**
   * @returns <div> with the audio controls, audio player, and song selector elements.
   */
  getAudioPlayerUIElements() {
    var div = document.createElement("div");
    var controlsDiv = document.createElement("div");
    controlsDiv.setAttribute("id", `player_controls_${this.uid}`);
    controlsDiv.appendChild(this.orderMode);
    controlsDiv.appendChild(this.skip);
    controlsDiv.appendChild(this.markTimestamp);
    controlsDiv.appendChild(this.muteToggle);
    controlsDiv.appendChild(this.ban);
    div.appendChild(controlsDiv);
    var songSelectorDiv = document.createElement("div");
    songSelectorDiv.appendChild(this.songSelector);
    div.appendChild(songSelectorDiv);
    var audioDiv = document.createElement("div");
    audioDiv.appendChild(this.player);
    div.appendChild(audioDiv);
    return div;
  }

  #generateAudioElement(){
    var player = document.createElement("audio");
    player.setAttribute("id",`ACTIVE_PLAYER_${uid}`);
    player.setAttribute("controls",true);
    player.setAttribute("autoplay",true);
    return player;
  }
  
  /**
   * Gets the play order mode button 
   * 🔀 shuffle
   * 🔃 seqential
   * 🔂 repeat single
   * 🔁 ?
   * 🔄 ?
   * @returns <button> with eventlisteners already attached.
   */
  #generatePlayOrderModeButton() {
    var button = document.createElement("button");
    button.setAttribute("id",`play_order_mode_${this.uid}`);
    button.textContent = playOrderModeKeys[0];
    
    button.addEventListener("click", (event) => {
      event.target.textContent = playOrderModeKeys[(Math.max(playOrderModeKeys.indexOf(event.target.textContent), 0) + 1) % playOrderModeKeys.length];
      Logger.log(`Updated play mode order to ${event.target.textContent}`,1);
    });

    return button;
  }
  /**
   * Gets the skip song button ⏭
   * @returns <button> with eventlisteners already attached.
   */
  #generateSkipButton() {
    const buttonText = '⏭';
    
    var button = document.createElement("button");
    button.setAttribute("id",`skip_song_${this.uid}`);
    button.textContent = buttonText;

    
    button.addEventListener("click", (event) => {
      // TODO: implement this bit
      Logger.log(`TODO: implement ${event.target.textContent}`,1);
    });

    return button;
  }
  
  /**
   * Gets the mark timestamp of current song button ⭐
   * @returns <button> with eventlisteners already attached.
   */
  #generateMarkTimestampButton() {
    const buttonText = '⭐';
    
    var button = document.createElement("button");
    button.setAttribute("id",`mark_timestamp_${this.uid}`);
    button.textContent = buttonText;

    
    button.addEventListener("click", (event) => {
      // TODO: implement this bit
      Logger.log(`TODO: implement ${event.target.textContent}`,1);
    });

    return button;
  }

  /**
   * Gets the ban song button ❌
   * @returns <button> with eventlisteners already attached.
   */
  #generateBanButton() {
    const buttonText = '❌';
    
    var button = document.createElement("button");
    button.setAttribute("id",`mark_timestamp_${this.uid}`);
    button.textContent = buttonText;
      
      
    button.addEventListener("click", (event) => {
      this.banSong(this.currentSong);
    });

    return button;
  }
  /**
   * Gets the mute toggle button 
   * 🔇 muted
   * 🔊 not muted
   * @returns <button> with eventlisteners already attached.
   */
  #generateToggleMuteButton() {
    const muteModes = [
      '🔊', // not muted,
      '🔇', // muted
    ];
    var button = document.createElement("button");
    button.setAttribute("id",`mute_mode_${this.uid}`);
    button.textContent = muteModes[0];
    
    button.addEventListener("click", (event) => {
      event.target.textContent = muteModes[(Math.max(muteModes.indexOf(event.target.textContent), 0) + 1) % muteModes.length];
      this.player.muted = event.target.textContent == '🔇';
      Logger.log(`Player sound was ${this.player.muted ? '' : 'un'}muted.`,1);
    });

    return button;
  }

  /**
   * Gets however we are going to visualize the song list selection
   */
  #generateSongSelector() {
    return SongView.getTableFromSongDb(this.songlist, this.uid);
  }


  /**
   * TODO: implement this func
   * - update player history
   * - update selector ui
   * - update page title
   * - update audio sources
   * - update mediasession controls
   * - any other updates neeeded?
   * @param {Song} nextSong the next song to be played
   */
  #loadSongIntoPlayer(nextSong) {
    Logger.log(`TODO: implement loadSongIntoPlayer logic.`);

    this.currentSong = nextSong;
    Logger.log(`Set current song to ${this.currentSong.getName()} by ${this.currentSong.getArtist()}`,2);
  }
}

class CollapsableContent {
  static TagPrefix = "toggle_";

  static attachStyleSheet() {
    var styleSheet = document.querySelector("style");
    if (!styleSheet) {
      styleSheet = document.createElement("style");
      document.appendChild(styleSheet);
    }
    const styles = [
      // todo: add styles here:
      `.collapseToggle {
      background-color: #777;
      color: white;
      cursor: pointer;
      padding: 18px;
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      font-size: 15px;
      }`,
      `.collapseToggle:hover {
      background-color: #555;
      }`
    ];
    styleSheet.innerHTML = styleSheet.innerHTML + styles.join("\n");
  }

  /**
   * Adds the collapsable event to all existing elements that have a CollapsableContent.TagPrefix class tag.
   */
  static enablePageToggles() {
    Array.from(
      document.querySelectorAll(CollapsableContent.TagPrefix)
    ).forEach((e) => e.addEventListener("click", CollapsableContent.toggleCollapseEvent));
  }

  /**
   * Inserts an button before/adjacent to the given content node.
   * @param {HTMLElement} contentNode The html element to convert to toggle button + toggled content.
   * @param {string} toggleButtonContent the content for the toggle button to display.
   * @returns <button> the button that was inserted for the toggle group.
   */
  static insertToggleButtonForElement(contentNode, toggleButtonContent='Toggle button') {
    var togglebutton = document.createElement("button");
    var groupId = contentNode.getAttribute("id");
    if (! groupId) {
      groupId = crypto.randomUUID().replace("-","");
      contentNode.setAttribute("id", groupId);
    } 
    togglebutton.setAttribute("id", `${CollapsableContent.TagPrefix}${groupId}`);
    togglebutton.textContent = toggleButtonContent;
    togglebutton.classList.add("collapseToggle");
    contentNode.insertAdjacentElement('beforebegin', togglebutton);
    CollapsableContent.setAsTogglePair(togglebutton, contentNode);
    return togglebutton;
  }
  /**
   * @param {HTMLElement} header The element, when clicked will hide the content.
   * @param {HTMLElement} content The content to be hidden.
   */
  static setAsTogglePair(header, content) {
    header.addEventListener("click", () => CollapsableContent.#toggleContentAction(content));
  }
  
  /**
   * The toggle collapse event function.
   * @param {Event} event the event.
   * @returns 
   */
  static toggleCollapseEvent(event) {
    let src = undefined;
    if (this instanceof HTMLElement) {
      src = this;
    } else if (event instanceof HTMLElement) {
      src = event;
    } else if (event instanceof Event) {
      src = event.target;
    } else {
      Logger.log(`Improper usage of toggleCollapse! unknown src for call! ${arguments}`, 5);
      return;
    }

    let toToggle = (
      src.id.startsWith(CollapsableContent.TagPrefix) ? 
        document.getElementById(src.id.replace(CollapsableContent.TagPrefix, "")): 
        null)
      ?? 
      src.nextElementSibling;
    if (!(toToggle instanceof HTMLElement)) {
      Logger.log(`unable to find toggleable content for the given source: ${src.id ?? src.outerHTML.toString()}`, 5);
      return;
    }
    CollapsableContent.#toggleContentAction(toToggle);
  }

  /**
   * Executes the toggle action for a collapse.
   * @param {HTMLElement} element the element to be collapsed.
   */
  static #toggleContentAction(element) {
    element.hidden = !element.hidden;
  }
}
