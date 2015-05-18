// Document ready function
$( document ).ready(function() {

  /**
   * Fluid videos using fitvids
   */
  $('.media-youtube-video').fitVids();


  /**
   * Accordion list
   * Manipulate first level of a list using `list-accordion` to a anchor and hides
   * sibling/child elments that later can be opened.
   */
  var acc = document.getElementsByClassName('list-accordion'),
      accLength = acc.length,
      acc2;

  if (accLength) {
    if(accLength == 1) {
      acc2 = acc[0];
      listAccordionEnhance();
    } else {
      for (var i = 0; i < accLength; i++) {
        acc2 = acc[i];
        listAccordionEnhance();
      }
    }
  }

  function listAccordionEnhance() {
    for (var i = 0, j = acc2.children.length; i < j; i++) {
      var parentLi = acc2.children[i],
          el = document.createElement('a'),
          value = parentLi.childNodes[0],
          siblingUl = parentLi.childNodes[1],
          elTextNode = document.createTextNode( value.nodeValue );
      
      el.setAttribute('href', '');
      el.setAttribute('class', 'is-closed title');
      el.appendChild(elTextNode);
      value.remove();
      parentLi.insertBefore(el, siblingUl);
    }
    
  }

  var accChild = $('.list-accordion').find('a.title');
  accChild.siblings().hide();

  accChild.on('click', function(e) {
    e.preventDefault();
    $(this).siblings('ul').slideToggle(300);
    $(this).toggleClass('is-closed is-open');
  });

}); // End document ready function
