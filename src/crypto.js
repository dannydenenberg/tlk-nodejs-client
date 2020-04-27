let SHA512 = require("crypto-js/sha512");
let CryptoJS = require("crypto-js");

export function hash(p) {
  return SHA512(p).toString(CryptoJS.enc.Base64);
}

// ALL Cookies are scope to the current URL.
export function setCookie(cname, cvalue, exdays) {
  let path = location.pathname.substring(1); // path is current URL. All cookies are scoped.
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie =
    cname + "=" + cvalue + ";" + expires + `;path=/${path}; SameSite=None`;
}

export function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/**
 * Create a text ID based on the current time and a random number added.
 */
export function generateTextId() {
  return new Date().getTime() + parseInt(Math.random() * 40);
}

// given a date, output "7:35 PM", etc.
export function formatAMPM(d) {
  // convert date to local date.
  let date = convertUTCToCurrentTime(d);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

function convertUTCToCurrentTime(date) {
  return new Date(date);
}
