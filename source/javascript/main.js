"use strict";

/**
 * Fluid videos using fitvids
 */
$('.js-fitvid').fitVids();


// Accordion
var acc = $('.js-accordion'),
    accChild = acc.children('li'),
    accGrandChild = accChild.children('ul');

// accGrandChild.hide();
var text = accChild[0].childNodes[0],
    textNode = document.createTextNode(text.nodeValue),
    anchor = document.createElement('a');

anchor.setAttribute('href', '');
anchor.appendChild(textNode);

console.log(anchor);

// for(var i = 0, j = accChild.length; i < j; i++ ) {
//   console.log(accChild[i]);
// }

accChild.on('click', function() {
  $(this).children('ul').slideToggle(300);
});