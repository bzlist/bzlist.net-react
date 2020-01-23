import React from "react";

import {createBrowserHistory} from "history";
import {settings} from ".";
import {Server} from "../models";

export const history = createBrowserHistory();

export const verboseGameStyle = (value: string): string => {
  // turn the short abbreviation string to the verbose version
  switch(value){
    case "CTF":
      return "Capture The Flag";
    case "FFA":
      return "Free For All";
    case "OFFA":
      return "Open (Teamless) Free For All";
    case "Rabbit":
      return "Rabbit Chase";
    default:
      break;
  }

  return value;
};

export const booleanYesNo = (value: boolean): JSX.Element => {
  // convert boolean value to yes/no with proper class
  return value ? <span className="yes">Yes</span> : <span className="no">No</span>;
};

export const autoPlural = (value: string): string => {
  return value.split(" ")[0] === "1" ? value : `${value}s`;
};

export const api =  async (endpoint: string, body: any = undefined, method = "POST", headers: any = {}): Promise<any> => {
  return fetch(`https://api.bzlist.net/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  }).then((res: Response) => res.json()).catch(console.error);
};

let _bzLoginURL;
if(process.env.NODE_ENV === "production"){
  _bzLoginURL = "https://my.bzflag.org/weblogin.php?action=weblogin&url=https%3A%2F%2Fbzlist.net%2Faccount%3Fusername%3D%25USERNAME%25%26token%3D%25TOKEN%25";
}else{
  _bzLoginURL = "https://my.bzflag.org/weblogin.php?action=weblogin&url=http%3A%2F%2Flocalhost%3A3000%2Faccount%3Fusername%3D%25USERNAME%25%26token%3D%25TOKEN%25";
}
export const bzLoginURL = _bzLoginURL;

export const notification = (title: string, body: string, tag: string, onclick: (this: Notification, event: Event) => void): void => {
  if(!window.Notification || !("serviceWorker" in navigator) || !("PushManager" in window)){
    return console.log("Browser does not support notifications");
  }

  if(Notification.permission === "denied"){
    return console.log("User blocked notifications.");
  }

  const notify = (): void => {
    navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
      registration.showNotification(title, {
        body,
        tag,
        // renotify: true,
        icon: "/images/icon/512.png",
        vibrate: [200, 100, 200],
        badge: "https://spyna.it/icons/android-icon-192x192.png",
        actions: [
          {
            action: "join",
            title: "Join"
          },
          {
            action: "close",
            title: "Close"
          }
        ]
      });
    });
  };

  if(Notification.permission === "granted"){
    notify();
  }else{
    Notification.requestPermission().then((result) => {
      if(result === "granted"){
        notify();
      }else{
        console.log("User blocked notifications.");
      }
    });
  }
};

export const notificationStatusText = (): string => {
  if("Notification" in window){
    const text = Notification.permission;
    return text === "default" ? "not enabled" : text;
  }

  return "not supported";
};

export const favoriteServer = (server: Server): void => {
  if(!server){
    return;
  }

  const address = `${server.address}:${server.port}`;
  const favoriteServers = settings.getJson("favoriteServers", []);

  if(favoriteServers.includes(address)){
    favoriteServers.splice(favoriteServers.indexOf(address), 1);
  }else{
    favoriteServers.splice(favoriteServers.indexOf(address), 0, address);
  }

  settings.set("favoriteServers", JSON.stringify(favoriteServers));
};

export const isFavoriteServer = (server: Server | null): boolean => {
  if(!server){
    return false;
  }

  return settings.getJson("favoriteServers", []).includes(`${server.address}:${server.port}`);
};
