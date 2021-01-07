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
* Change path of sprite.css in sprite.html to ../css/sprite.css
* Search and remove the -fixed
* Search and replace -hover by :hover
* Wrap every :hover with @media (pointer: fine) and (hover: hover) {}
* Add hover class to sprite.html body
* Create optional mirrored icons for arrow up and arrow left by copying down and right and adding transform: rotate(180deg);
* Fix color for icon-box to #252527
* Test sprite.html in your browser

# Modified files
* Some icons were modified they have the -fixed in their names and should be used instead of original ones
