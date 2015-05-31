(function($) {
  $.fn.tabComplete = function(options) {
    var trie = new Triejs({});
    var index = 0;
    var val;
    var words;
    var word;
    var saved = false;
    var possible;
    var position;
    var wordPos;
    $(this).keypress(function(e) {
      if (e.keyCode === 9) {
        e.preventDefault();
        if (!saved) {
          position = $(this).getCursorPosition();
          val = $(this).val();

          words = val.split(" ");
          var lcount = 0;
          for (var i = 0; i < words.length; i++) {
            var w = words[i];
            lcount += w.length + 1;
            if (lcount >= position) {
              var word = words[i];
              wordPos = i;
              break;
            }
          };

          saved = true;
          possible = trie.find(word);

        } else {
          index++;
        }
        if (possible && index >= possible.length) {
          index = 0;
        }
        if (possible) {
          var dupe = words;
          dupe[wordPos] = possible[index];
          var newPos = words.slice(0, wordPos + 1).join(" ").length;
          $(this).val(words.join(" "));
          $(this).selectRange(newPos);
        } 
      } else {
        saved = false;
        index = 0;
      }
    });
  };

  $.fn.selectRange = function(start, end) {
    if(!end) end = start; 
    return this.each(function() {
      if (this.setSelectionRange) {
        this.focus();
        this.setSelectionRange(start, end);
      } else if (this.createTextRange) {
        var range = this.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
      }
    });
  };

  $.fn.getCursorPosition = function() {
    var el = $(this).get(0);
    var pos = 0;
    if ('selectionStart' in el) {
      pos = el.selectionStart;
    } else if ('selection' in document) {
      el.focus();
      var Sel = document.selection.createRange();
      var SelLength = document.selection.createRange().text.length;
      Sel.moveStart('character', -el.value.length);
      pos = Sel.text.length - SelLength;
    }
    return pos;
  };
}(jQuery));