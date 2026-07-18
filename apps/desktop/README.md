# @ai3d/desktop

Desktop presentation client boundary.

## Milestone 2 responsibility

`DesktopClient` is a framework-independent presentation adapter that forwards
entered prompts to `ApplicationFacade` and returns a UI-ready result. No desktop
framework has been selected, so this package intentionally has no window or widget
implementation. It does not call Blender directly.

## Architectural placement

An eventual Electron, Tauri, or other desktop shell consumes this package and the
application API rather than duplicating business logic.
