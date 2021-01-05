//24.12.2020 Начал изучение jquery
if( window.$ == null) {
  var jquery = require("jquery");
  window.$ = window.jQuery = jquery; // notice the definition of global variables here
  require("jquery-ui-dist/jquery-ui.js");
}

var h_container_style = "\
  user-select: none;\
  -moz-user-select: none;\
  -webkit-user-select: none;\
  -ms-user-select: none;\
  \
  display: flex;\
  flex-wrap: nowrap;\
  align-items: center;\
  justify-content: stretch;\
";

var v_container_style = "\
  user-select: none;\
  -moz-user-select: none;\
  -webkit-user-select: none;\
  -ms-user-select: none;\
  \
  display: flex;\
  flex-wrap: nowrap;\
  flex-direction: column;\
  align-items: center;\
  justify-content: stretch;\
";

/* MODEL in MVC*/

//Создание модели + создание событий при изменении модели
export function Slider_CreateModel(minimumValue, maximumValue, Value1 = null, Value2 = null, stepValue = null) {
  if( isNaN(minimumValue) ||
      isNaN(maximumValue) ||
      minimumValue > maximumValue ||
      (Value1 != null && isNaN(Value1)) ||
      (Value2 != null && isNaN(Value2)))
    throw new Error("Давай нормальные данные");

  if(Value1 == null && Value2 == null)
    Value1 = (minimumValue + maximumValue) / 2;
    
  var result = {
    _min: minimumValue,
    _max: maximumValue,
    _val1: null,
    _val2: null,
    _step: stepValue,
    setMinMax: function (minimumValue, maximumValue, stepValue = null) { 
      if(isNaN(minimumValue) || isNaN(maximumValue) || minimumValue > maximumValue)
        throw new Error("Давай нормальные данные");
      this._min = minimumValue;
      this._max = maximumValue;

      if(this._val1 != null) {
        if(this._val1 < minimumValue)
          this.Value1 = minimumValue;
        if(this._val1 > maximumValue)
          this.Value1 = maximumValue;
      }

      if(this._val2 != null) {
        if(this._val2 < minimumValue)
          this.Value2 = minimumValue;
        if(this._val2 > maximumValue)
          this.Value2 = maximumValue;
      }

      $(this).trigger("changed");

      return this;
    }
  };

  Object.defineProperty(result, "Step", {
    get: function() { return this._step; },
    set: function(value) {
      value = Number(value);
      if(isNaN(value))
        value = null;
      if(value == 0)
        value = null;
      console.log(value);
      this._step = value;

      var t = this.Value2;
      this.Value2 = null;
      this.Value1 = this._val1;
      this.Value2 = t;
    },
  });

  Object.defineProperty(result, "Value1", {
    get: function() { return this._val1; },
    set: function(value) {
      if(value == null) {
        this._val1 = null;
        $(this).trigger("changed");
        return;
      }
      if(isNaN(value))
        throw new Error(`Цифры давай! Модель требует циферки! (${value})`);

      if(this._step != null) 
        if(value < this._max)
          value = Math.round((value - this._min) / this._step) * this._step + this._min;

      if(this._val2 != null && value > this._val2)
        value = this._val2;
      if(value > this._max)
        value = this._max;
      if(value < this._min)
        value = this._min;
      this._val1 = value;
      $(this).trigger("changed");
    }
  });
  Object.defineProperty(result, "Value2", {
    get: function() { return this._val2; },
    set: function(value) {
      if(value == null) {
        this._val2 = null;
        $(this).trigger("changed");
        return;
      }

      if(isNaN(value))
        throw new Error(`Цифры давай! Модель требует циферки! (${value})`);

      if(this._step != null) 
        if(value < this._max)
          value = Math.round((value - this._min) / this._step) * this._step + this._min;

      if(this._val2 != null && value < this._val1)
        value = this._val1;
      if(value > this._max)
        value = this._max;
      if(value < this._min)
        value = this._min;
      this._val2 = value;
      $(this).trigger("changed");
    }
  });
  Object.defineProperty(result, "Range", {
    get: function() { return this._max - this._min; },
  });

  result.Value1 = Value1;
  result.Value2 = Value2;

  return Object.create(result);
}

/* Функция вычисляет свободное пространство для ползунков*/
export function Slider_GetRange(element, vertical, prefix) {
  var left = element.find(`.${prefix}__left`);
  var right = element.find(`.${prefix}__right`);

  element = element.find(`.${prefix}__container_${(vertical)?"vertical":"horizontal"}`);

  if(vertical) {
    var Range = element.height();// Расчет доступного пространства для перемещения ползунков

    if(left.outerHeight(true) != null)
      Range -= left.outerHeight(true); // Исключаем высоту самих ползунков если они есть
    if(right.outerHeight(true) != null)
      Range -= right.outerHeight(true);// Исключаем высоту самих ползунков если они есть

    return Range;
  } else {
    var Range = element.width();// Расчет доступного пространства для перемещения ползунков

    if(left.outerWidth(true) != null)
      Range -= left.outerWidth(true); // Исключаем ширину самих ползунков если они есть
    if(right.outerWidth(true) != null)
      Range -= right.outerWidth(true);// Исключаем ширину самих ползунков если они есть

    return Range;
  }
}

/* CONTROLLER in MVC */
export function Slider_Controller(model, element, vertical, prefix) {
  var dragging = 0;// 0 не таскаем, -1 таскаем левый, 1 таскаем правый
  var StartPointX, StartPointY;
  var OldValue;

  element = $(element);

  var left = element.find(`.${prefix}__left`);
  var right = element.find(`.${prefix}__right`);

  left.on("touchstart mousedown", function (e) {

    dragging = -1;
    if (e.type == "touchstart") {
      if(e.originalEvent.touches.length > 1)
        return;
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      StartPointX = touch.pageX;
      StartPointY = touch.pageY;
    } else {
      StartPointX = e.pageX;
      StartPointY = e.pageY;
    }
    OldValue = model.Value1;//Фиксируем начальные значения и координаты для перетакивания левого ползунка
    e.stopPropagation();
    e.preventDefault();
  });
  right.on("touchstart mousedown", function (e) {
    dragging = 1;
    if (e.type == "touchstart") {
      if(e.originalEvent.touches.length > 1)
        return;
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      StartPointX = touch.pageX;
      StartPointY = touch.pageY;
    } else {
      StartPointX = e.pageX;
      StartPointY = e.pageY;
    }
    OldValue = model.Value2;//Фиксируем начальные значения и координаты для перетакивания правого ползунка
    e.stopPropagation();
    e.preventDefault();
  });
  $(window).on("touchmove mousemove", function (e) {
    if(!dragging)
      return;
    var DeltaX, DeltaY;
    if (e.type == "touchmove") {
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      DeltaX = touch.pageX - StartPointX;
      DeltaY = touch.pageY - StartPointY;
    } else {
      DeltaX = e.pageX - StartPointX;
      DeltaY = e.pageY - StartPointY;
    }
    var Range = Slider_GetRange(element, vertical, prefix);
    if(dragging < 0) { //Перетаскивание левого
      model.Value1 = OldValue + model.Range * ((vertical)?DeltaY:DeltaX) / Range;
    }
    if(dragging > 0) { //Перетаскивание правого
      model.Value2 = OldValue + model.Range * ((vertical)?DeltaY:DeltaX) / Range;
    }
    e.stopPropagation();
    e.preventDefault();
  });
  $(window).on("touchend touchcancel mouseup", function (e) {
    dragging = 0;
  });
}

/* VIEWs in MVC */
export function Slider(model, vertical = true, prefix = "double_slider") {

  if(model == null)
    model = Slider_CreateModel(0, 1, 0, 1);

  var orientation = (vertical)?"vertical":"horizontal";

  $(this).each(function () {
    var element = $(this);
    element.prop("double_slider__model", model);
    element.prop("double_slider__prefix", prefix);
    element.prop("double_slider__orientation", orientation);

    element.empty();
    var html = 
      `<div class='${prefix}__wrapper'>\
        <div class='${prefix}__container_${orientation}' style='${(vertical)?v_container_style:h_container_style}'>\
        <div class='${prefix}__spacer_left'></div>\
        ${(model.Value1 != null) ?
          `<div class='${prefix}__left'></div>` : ``}\
        <div class='${prefix}__spacer_middle_${orientation}'></div>\
        ${(model.Value2 != null) ?
          `<div class='${prefix}__right'></div>` : ``}\
        <div class='${prefix}__spacer_right'></div></div></div>`;
    element.html(html);

    //Перемещение ползунков при изменении модели
    var changed = function () {
      var left = element.find(`.${prefix}__spacer_left`);
      var middle = element.find(`.${prefix}__spacer_middle_${orientation}`);
      var right = element.find(`.${prefix}__spacer_right`);

      if(model.Value1 == null && model.Value2 != null) {
        left.css("flex-grow", null);
        left.css("flex-shrink", null);
        middle.css("flex-grow", model.Value2);
        middle.css("flex-shrink", model.Value2);
        right.css("flex-grow", model.Range - model.Value2);
        right.css("flex-shrink", model.Range - model.Value2);
      }
      if(model.Value1 != null && model.Value2 != null) {
        left.css("flex-grow", model.Value1);
        left.css("flex-shrink", model.Value1);
        middle.css("flex-grow", model.Value2 - model.Value1);
        middle.css("flex-shrink", model.Value2 - model.Value1);
        right.css("flex-grow", model.Range - model.Value2);
        right.css("flex-shrink", model.Range - model.Value2);
      }
      if(model.Value1 != null && model.Value2 == null) {
        left.css("flex-grow", model.Value1);
        left.css("flex-shrink", model.Value1);
        middle.css("flex-grow", model.Range - model.Value1);
        middle.css("flex-shrink", model.Range - model.Value1);
        right.css("flex-grow", null);
        right.css("flex-shrink", null);
      }
  //    left.animate({"margin-left": left_margin}, { duration: 'fast', queue: false });
  //    middle.animate({"width": right_margin}, { duration: 'fast', queue: false });
    }
    $(model).on("changed", changed);
    changed();
    
    Slider_Controller(model, element, vertical, prefix);
  });
  return this;
}

export function Slider_Label(model, left_or_right = null, IntlNF) {
  if(IntlNF == null)
    IntlNF = {
      format: function (value) {return value;},
    };
  $(this).each(function () {
    var element = $(this);

    var changed = function () {
      element.text("");

      //Рисуем только значение 2 в случае если это указано явно или у нас нет значения 1 и явно не запрещено рисовать значение 2
      if( model.Value1 == null && model.Value2 != null && (left_or_right == null || !left_or_right) ||
          model.Value2 != null && left_or_right != null && !left_or_right)
        element.text(IntlNF.format(model.Value2));

      //Рисуем только значение 1 в случае если это указано явно или у нас нет значения 2 и явно не запрещено рисовать значение 1
      if( model.Value2 == null && model.Value1 != null && (left_or_right == null || left_or_right) ||
          model.Value1 != null && left_or_right != null && left_or_right)
        element.text(IntlNF.format(model.Value1));

      //Рисуем оба значения если это на запрещено и есть оба значения
      if( model.Value1 != null && model.Value2 != null && left_or_right == null)
        element.text(IntlNF.format(model.Value1) + " - " + IntlNF.format(model.Value2));
    }
    $(model).on("changed", changed);

    changed();

  });
  return this;
}

$.fn.mySlider = Slider;
$.fn.mySliderLabel = Slider_Label;
$.fn.mySliderModel = Slider_CreateModel;

