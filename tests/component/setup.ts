// @ts-nocheck — happy-dom globals don't match lib.dom; bootstrap only.
import React from "react";
import { Window } from "happy-dom";

globalThis.React = React;

const window = new Window({ url: "http://localhost:3000" });

globalThis.window = window as unknown as Window & typeof globalThis.window;
globalThis.document = window.document;
globalThis.navigator = window.navigator;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.Text = window.Text;
globalThis.DocumentFragment = window.DocumentFragment;
globalThis.CustomEvent = window.CustomEvent;
globalThis.Event = window.Event;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.MutationObserver = window.MutationObserver;
globalThis.ResizeObserver = window.ResizeObserver;
