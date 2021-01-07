//24.12.2020 Начал изучение jquery
;(function($) {
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

  function GetPointFromEvent(e) {
    if(e.type in ["touchstart", "touchmove", "touchend"]) {
      if(e.originalEvent.touches.length > 1)
        return null;
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      return {pageX: touch.pageX, pageY: touch.pageY};
    }
    return {pageX: e.pageX, pageY: e.pageY};
  }

  /* MODEL in MVC*/

  //Создание модели + создание событий при изменении модели
  function Slider_CreateModel(minimumValue, maximumValue, Value1 = null, Value2 = null, stepValue = null) {
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

        if(this._val1 != null && value < this._val1)
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
    Object.defineProperty(result, "Range1", {
      get: function() { return (this._val2 == null)?this.Range:(this._val2 - this._min); },
    });
    Object.defineProperty(result, "Range2", {
      get: function() { return (this._val1 == null)?this.Range:(this._max - this._val1); },
    });
    Object.defineProperty(result, "Min", {
      get: function() { return this._min; },
      set: function(value) { this.setMinMax(value, this._max, this._step); },
    });
    Object.defineProperty(result, "Max", {
      get: function() { return this._max; },
      set: function(value) { this.setMinMax(this._min, value, this._step); },
    });

    result.Value1 = Value1;
    result.Value2 = Value2;

    return Object.create(result);
  }


  /* CONTROLLER in MVC */
  function Slider_Controller(model, element, vertical, prefix) {
    var dragging = 0;// 0 не таскаем, -1 таскаем левый, 1 таскаем правый
    var last_active = 0;// 0 никто, -1 левый, 1 правый
    var StartPointX, StartPointY;
    var OldValue;

    element = $(element);

    var left = element.find(`.${prefix}__left`);
    var right = element.find(`.${prefix}__right`);
    var container = element.find(`.${prefix}__container_${(vertical)?"vertical":"horizontal"}`);

    container.on("touchstart mousedown", function (e) {
      var Point = GetPointFromEvent(e);// Получаем позицию курсора на странице
      if(!Point)// Если ошибка - нафиг
        return;

      var lpos = left.position(); //Получаем позиции левого
      var rpos = right.position(); // и правого ползунков

      // Если нет одного из ползунков, то противополжный становится активным
      if(lpos == null)
        last_active = 1;
      if(rpos == null)
        last_active = -1;

      if(vertical) {
        if(lpos != null && Point.pageY <= lpos.top)
          last_active = -1;// Переназначаем активный ползунок, если мышь выше от верхнего, то верхний
        if(rpos != null && Point.pageY >= rpos.top)
          last_active = 1;// Переназначаем активный ползунок, если мышь ниже от нижнего, то нижний
        if(!last_active) { // Так и не определились кто активный :(
          var l = lpos.top + left.outerHeight();// Учтем высоту верхнего
          last_active = (Point.pageY <= (l + rpos.top) / 2)? -1: 1; //Куда ближе, тот и тащим
        } //Нахера всё так сложно? А вдруг последний активный уже был известен, тогда он переопределился бы только в явных случаях
    
        if(last_active < 0) { // Тащим верхний?
          var cpl = container.position().top;// Берем крайний верхний пиксель
          var range_px = ((rpos == null)?container.height():(rpos.top - cpl)) - left.outerHeight(); //Считаем всё свободное пространство для ползунка исключая сам ползунок и учитывая нижний ползунок (он нам мешает тоже)
          model.Value1 = model.Range1 * (Point.pageY - cpl - left.outerHeight()/2) / range_px + model._min;// Переносим отношение клика от верхнего края к свободному пространству на модель
        } else { // Тащим правый
          var cpr = container.position().top + container.height();// Берем крайний нижний пиксель
          var range_px = ((lpos == null)?container.height():(cpr - lpos.top - left.outerHeight())) - right.outerHeight();//Считаем всё свободное пространство для ползунка исключая сам ползунок и учитывая верхний ползунок (он нам мешает тоже)
          model.Value2 = model._max - model.Range2 * (cpr - Point.pageY - right.outerHeight()/2) / range_px;// Переносим отношение клика от нижнего края к свободному пространству на модель
        }
      } else {
        if(lpos != null && Point.pageX <= lpos.left)
          last_active = -1;// Переназначаем активный ползунок, если мышь слева от левого, то левый
        if(rpos != null && Point.pageX >= rpos.left)
          last_active = 1;// Переназначаем активный ползунок, если мышь справа от правого, то правый
        if(!last_active) { // Так и не определились кто активный :(
          var l = lpos.left + left.outerWidth();// Учтем ширину левого
          last_active = (Point.pageX <= (l + rpos.left) / 2)? -1: 1; //Куда ближе, тот и тащим
        } //Нахера всё так сложно? А вдруг последний активный уже был известен, тогда он переопределился бы только в явных случаях

        if(last_active < 0) { // Тащим левый
          var cpl = container.position().left;// Берем крайний левый пиксель
          var range_px = ((rpos == null)?container.width():(rpos.left - cpl)) - left.outerWidth(); //Считаем всё свободное пространство для ползунка исключая сам ползунок и учитывая правый ползунок (он нам мешает тоже)
          model.Value1 = model.Range1 * (Point.pageX - cpl - left.outerWidth()/2) / range_px + model._min;// Переносим отношение клика от левого края к свободному пространству на модель
        } else { // Тащим правый
          var cpr = container.position().left + container.width();// Берем крайний правый пиксель
          var range_px = ((lpos == null)?container.width():(cpr - lpos.left - left.outerWidth())) - right.outerWidth(); //Считаем всё свободное пространство для ползунка исключая сам ползунок и учитывая левый ползунок (он нам мешает тоже)
          model.Value2 = model._max - model.Range2 * (cpr - Point.pageX - right.outerWidth()/2) / range_px;// Переносим отношение клика от правого края к свободному пространству на модель
        }
      }
    });
    left.on("touchstart mousedown", function (e) {
      var Point = GetPointFromEvent(e);
      if(!Point)
        return;
      dragging = -1;
      last_active = dragging;
      StartPointX = Point.pageX;
      StartPointY = Point.pageY;

      OldValue = model.Value1;//Фиксируем начальные значения и координаты для перетакивания левого ползунка
      e.stopPropagation();
      e.preventDefault();
    });
    right.on("touchstart mousedown", function (e) {
      var Point = GetPointFromEvent(e);
      if(!Point)
        return;
      dragging = 1;
      last_active = dragging;
      StartPointX = Point.pageX;
      StartPointY = Point.pageY;

      OldValue = model.Value2;//Фиксируем начальные значения и координаты для перетакивания правого ползунка
      e.stopPropagation();
      e.preventDefault();
    });
    $(window).on("touchmove mousemove", function (e) {
      if(!dragging)
        return;
      var Point = GetPointFromEvent(e);
      if(!Point) {
        dragging = 0;
        return;
      }
      var DeltaX = Point.pageX - StartPointX;
      var DeltaY = Point.pageY - StartPointY;

      var Range = 0;
      if(vertical) {
        Range = container.height();// Расчет доступного пространства для перемещения ползунков
  
        if(left.outerHeight(true) != null)
          Range -= left.outerHeight(true); // Исключаем высоту самих ползунков если они есть
        if(right.outerHeight(true) != null)
          Range -= right.outerHeight(true);// Исключаем высоту самих ползунков если они есть
      } else {
        Range = container.width();// Расчет доступного пространства для перемещения ползунков
  
        if(left.outerWidth(true) != null)
          Range -= left.outerWidth(true); // Исключаем ширину самих ползунков если они есть
        if(right.outerWidth(true) != null)
          Range -= right.outerWidth(true);// Исключаем ширину самих ползунков если они есть
      }

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
  function Slider(vertical = true, prefix = "double_slider") {
    var orientation = (vertical)?"vertical":"horizontal";

    return this.each(function () {
      var element = $(this);
      var data = element.data("dmx_Slider");
      if(!data || !data.model)
        return;

      var model = data.model;
  
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
          left.css("flex-grow", model.Value1 - model.Min);
          left.css("flex-shrink", model.Value1 - model.Min);
          middle.css("flex-grow", model.Value2 - model.Value1);
          middle.css("flex-shrink", model.Value2 - model.Value1);
          right.css("flex-grow", model.Max - model.Value2);
          right.css("flex-shrink", model.Max - model.Value2);
        }
        if(model.Value1 != null && model.Value2 == null) {
          left.css("flex-grow", model.Value1 - model.Min);
          left.css("flex-shrink", model.Value1 - model.Min);
          middle.css("flex-grow", model.Max - model.Value1);
          middle.css("flex-shrink", model.Max - model.Value1);
          right.css("flex-grow", null);
          right.css("flex-shrink", null);
        }
      }
      $(model).on("changed", changed);
      changed();
      
      Slider_Controller(model, element, vertical, prefix);
    });
  }

  function Slider_Label(left_or_right = null, IntlNF) {
    if(IntlNF == null)
      IntlNF = {
        format: function (value) {return value;},
      };
    $(this).each(function () {
      var element = $(this);
      var data = element.data("dmx_Slider");
      if(!data && !data.model)
        return;
      var model = data.model;

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

  var methods = {
    init : function () { 
      methods.set_new_model.apply(this, [0, 1]);
      methods.slider.apply(this, arguments);
    },
    set_model : function (model) {
      return $(this).each( function () {

        var data = $(this).data('dmx_Slider');
  
        if(!data) {
          $(this).data('dmx_Slider', {
            model : model,
          });
        } else {
          data.model = model;
          $(this).data('dmx_Slider', data);
        }

      });
    },
    new_model : function (minimumValue, maximumValue, Value1 = null, Value2 = null, stepValue = null) {
      return Slider_CreateModel(minimumValue, maximumValue, Value1, Value2, stepValue);
    },
    set_new_model : function (minimumValue, maximumValue, Value1 = null, Value2 = null, stepValue = null) {
      return methods.set_model.apply(this, [methods.new_model(minimumValue, maximumValue, Value1, Value2, stepValue)]);
    },
    get_model : function () {
      var model = new Array();
      $(this).each(function () {
        var data = $(this).data("dmx_Slider");
        if(!data || !data.model)
          return;
        model[model.length] = data.model;
      })
      return $(model);
    },
    value : function () { // Тоже что и value1
      return methods.value1.apply(this, arguments);
    },
    value1 : function () {
      var model = methods.get_model.apply(this);
      return model[0].Value1;
    },
    value2 : function () {
      var model = methods.get_model.apply(this);
      return model[0].Value2;
    },
    min : function () {
      var model = methods.get_model.apply(this);
      return model[0].Min;
    },
    max : function () {
      var model = methods.get_model.apply(this);
      return model[0].Max;
    },
    minimum : function () { // Тоже что и min
      return methods.min.apply(this, arguments);
    },
    maximum : function () { // Тоже что и max
      return methods.max.apply(this, arguments);
    },
    label : Slider_Label,
    slider : Slider,
  };

  $.fn.dmx_Slider = function( method ) {
    // логика вызова метода
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else
//     if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
//    } else {
//     throw 'Метод с именем ' +  method + ' не существует для jQuery.dmx_Slider';
//    } 
  };
})(require("jquery"))