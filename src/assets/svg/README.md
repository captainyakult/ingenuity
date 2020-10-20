# How to generate icons
* Go to https://icomoon.io/
* Upload all the svgs in your library
* Click on Generate SVG
* Click on the options gear icon
  * Class prefix: -icon
  * Formats: Tiles (CSS sprite)
    * colums 16
    * margin 16px
* Click on Download
* Move resulting sprite svg and css to svg and css folders
* Change path of sprite.svg in sprite.css to ../svg/sprite.svg
* Search and remove the -fixed
* Search and replace -hover by :hover
* Prepend body.hover for every hover statement

# Modified files
* Some icons were modified they have the -fixed in their names and should be used instead of original ones