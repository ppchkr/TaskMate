# TaskFlow

TaskFlow (TaskMate) is a responsive mobile web application for students to
organize group projects and track shared tasks.

## Features

- Project creation, editing, membership, and search
- Task creation, editing, filtering, and status tracking
- Deadline and project progress tracking
- Responsive mobile, tablet, and desktop layouts

## Technologies

- HTML
- CSS, including responsive media queries
- JavaScript ES Modules
- Git and GitHub

## Run locally

The app uses native JavaScript modules. Browsers block module imports from
`file://`, so run a small local web server instead of opening `index.html`
directly.

On Windows, macOS, or Linux with Python 3 installed, open a terminal in the
project folder and run:

```sh
python -m http.server 5550 --bind 127.0.0.1
```

On macOS or Linux, use `python3` if `python` does not launch Python 3. Then open
<http://localhost:5550> in a browser. Press `Ctrl+C` in the terminal to stop
the server.

The demo uses in-memory sample data; changes reset when the page is refreshed.

## Project structure

```text
index.html
assets/
  images/
css/
  main.css
  components/
  responsive/
js/
  demo-data.js
  main.js
  project.js
  task.js
  utils.js
```

- `index.html` contains the application markup and loads the module entry point.
- `css/main.css` imports the theme, base, layout, component, and responsive
  styles in cascade order.
- `js/main.js` initializes navigation and wires the application modules.
- `js/demo-data.js` exports sample data, labels, and application state.
- `js/project.js` manages project rendering and interactions.
- `js/task.js` manages task rendering and interactions.
- `js/utils.js` exports shared display and form helpers.
- `assets/images/` contains local image assets.

The UI uses the locally installed TH Sarabun New or TH SarabunPSK font when
available, with Google Fonts' Sarabun as a fallback. The TaskMate wordmark uses
Outfit. Internet access is needed for Google Fonts when the fonts are not
installed locally.
