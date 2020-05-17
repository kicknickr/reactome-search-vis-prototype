# Reactome Advanced Knowledgebase Search and Pathway Visualization Prototype App
#### A project completed by Ryan Vereque in partial fulfillment of the requirements for the Degree of Bachelor of Science in Computer Science

## Overview
This web app is a prototype made with the intention of furthering the development of tools that expand upon
those provided by the Reactome Project in the areas of knowledgebase searching and pathway diagram viewing.
Implemented with Node, Babel, Parcel, D3, and Material Web Components, among other packages.
See \<TODO insert link?\> for the corresponding research paper written for this project.
A copy of the paper is archived for conveniance at [./ProjectDocsAndReferenceMaterial/ResearchPaperDocs](./ProjectDocsAndReferenceMaterial/ResearchPaperDocs)

## Quick Start Guide
> :warning: **Important!**: Please see section [CORS Security Issues in Browsers - A workaround](#CORS-Fix) for a common issue with opening a local copy of the web app.

A prebuilt version of the app can be accessed by opening [./build/index.html](./build/index.html) in the browser.
### Quick Build
Assuming Node and NPM are installed on the machine and a terminal is open to the top level directory,
here are the npm commands to build the project.
```bash
npm install
```
and then either
<br><br>
```bash
npm run parcel-build --scripts-prepend-node-path=auto
```
to build the project to html, js, and css files, located at [./build](./build), or
<br><br>
```bash
npm run parcel-dev --scripts-prepend-node-path=auto
```

to launch a development server on <http://localhost:1234/>.

## CORS Security Issues in Browsers - A workaround
<a name="CORS-Fix"></a>
Opening a local web app is usually as simple as opening an index.html or localhost port in a browser of choice.
While this is the final step, the browser must first be configured to allow local web apps to
make requests to remote servers, such as the Reactome API.
In some browsers, a web page making a remote request from a
local origin is considered a CORS security risk and is blocked by default.
If the app were hosted on an actual web-server and not run locally, this would not be a problem.

A simple way to remove the restrictions imposed by this CORS security violation is to install a browser add-on that disables these restrictions.
This technique was used during the development process.
It should be noted that tampering with a browser's security settings should be done cautiously.
To limit potential risks, one may wish to install/enable and uninstall/disable such an add-on before and after using the desired app.

In the Firefox browser, the "Cross Domain - CORS" add-on works once it is turned on, without the need for additional configuration.
To specify a whitelist of request origins for further risk reduction, the "CORS Everywhere" add-on also works.
This second add-on was used during the development process while a dev server was running on localhost.
The entry placed in add-on's whitelist for the development server was as follows: `/^https?...localhost:1234.+/i`.

Once a browser is configured properly, [./build/index.html](./build/index.html) or <http://localhost:1234/> may be opened in the browser to open the app developed in this project.
## Node scripts
For a more complete list of node scripts located in package.json, see the following list and their descriptions.
Note that running each script requires the command
```bash
npm run insert-script-of-choice --scripts-prepend-node-path=auto
```
* eslint - Run project code linting using the eslint package
* jsdoc - Generate JSDoc content for the project at [./jsdocOutput](./jsdocOutput), but first remove old docs. Note that project documentation is not entirely complete.
* parcel-build - Parcel will bundle project assets, and output them to [./build](./build)
* parcel-dev - Parcel will bundle project assets, then serve them on <http://localhost:1234/> with Hot Module Replacement (HMR)
* build - jsdoc script ; parcel-build script
* dev - jsdoc script ; parcel-dev script