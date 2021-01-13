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

# How to import icons
* Move resulting /sprite svg html and css to svg and css folders
* Change path of sprite.svg in sprite.css to ../svg/sprite.svg
* Change path of sprite.css in sprite.html to ../css/sprite.css
* Search and remove the -fixed in sprite.css and html
* Search and remove the -hover in sprite.html
* Search and replace -hover by :hover in sprite.css
* Wrap every :hover with @media (pointer: fine) and (hover: hover) {}
* Add hover class to sprite.html body
* Create optional mirrored icons for arrow up and arrow left by copying down and right and adding transform: rotate(180deg);
* Fix fill color for icon-box to #252527 in sprite.svg
* Test sprite.html in your browser
* Run a diff to see if anything is missing
* Test in app

# Modified files
* Some icons were modified they have the -fixed in their names and should be used instead of original ones
