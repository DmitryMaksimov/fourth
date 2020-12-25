//24.12.2020 Начал изучение jquery
if( window.$ == null) {
  var jquery = require("jquery");
  window.$ = window.jQuery = jquery; // notice the definition of global variables here
  require("jquery-ui-dist/jquery-ui.js");
}

export function Slider_CreateModel(minimumValue, maximumValue, defaultValue) {
  return {
    min: minimumValue,
    max: maximumValue,
    def: defaultValue
  }
}

$(window).on("load", function () {
  $(".super_slider").each(function () {
    //alert($(this))
  });
});
