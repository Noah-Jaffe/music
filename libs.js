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
      let end_at = Date.now() + timeout_sec * 1000;
      while (!window.navigator.onLine) {
        if (Date.now() >= end_at) {
          throw "Timeout exception, offline for too long!";
        }
      }
    }
    var attempt = 0;
    let result = null;
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
    let response = await get_successful_fetch(url);
    let data = await response.json();
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
    let scriptEle = document.createElement("script");
  
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

    for (let ev in window) {
      if (/^on/.test(ev)) types[types.length] = ev;
    }

    let elements = [];
    for (let i = 0; i < allElements.length; i++) {
      const currentElement = allElements[i];
      for (let j = 0; j < types.length; j++) {
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
  #requiredScriptSrcs = [
    "https://cdn.jsdelivr.net/npm/flatpickr",
    "https://cdn.jsdelivr.net/npm/sortablejs/Sortable.min.js",
    "https://github.com/6pac/SlickGrid/blob/master/dist/browser/slick.core.js",
    "https://github.com/6pac/SlickGrid/blob/master/dist/browser/slick.interactions.js",
    "https://github.com/6pac/SlickGrid/blob/master/dist/browser/slick.grid.js",
    "https://github.com/6pac/SlickGrid/blob/master/dist/browser/slick.formatters.js",
    "https://github.com/6pac/SlickGrid/blob/master/dist/browser/slick.editors.js",
    "https://github.com/6pac/SlickGrid/blob/master/dist/browser/slick.dataview.js",
  ];

  constructor(newElementId, columns, data, options){
    this.#requiredScriptSrcs.forEach(src=>DEBUG.loadJS(src));
    // TODO: read https://github.com/6pac/SlickGrid/blob/master/examples/example5-collapsing.html to figure out what is needed for my stuff.
  }
  

}
