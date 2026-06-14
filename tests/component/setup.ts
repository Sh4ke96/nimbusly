import React from "react";
import { Window } from "happy-dom";

globalThis.React = React;

const window = new Window({ url: "http://localhost:3000" });

globalThis.window = window as unknown as Window & typeof globalThis.window;
globalThis.document = window.document as unknown as Document;
globalThis.navigator = window.navigator as unknown as Navigator;
globalThis.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
globalThis.Element = window.Element as unknown as typeof Element;
globalThis.Node = window.Node as unknown as typeof Node;
globalThis.Text = window.Text as unknown as typeof Text;
globalThis.DocumentFragment = window.DocumentFragment as unknown as typeof DocumentFragment;
globalThis.CustomEvent = window.CustomEvent as unknown as typeof CustomEvent;
globalThis.Event = window.Event as unknown as typeof Event;
globalThis.getComputedStyle = window.getComputedStyle.bind(window) as unknown as typeof getComputedStyle;
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(
  window
) as unknown as typeof requestAnimationFrame;
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(
  window
) as unknown as typeof cancelAnimationFrame;
globalThis.MutationObserver = window.MutationObserver as unknown as typeof MutationObserver;
globalThis.ResizeObserver = window.ResizeObserver as unknown as typeof ResizeObserver;
