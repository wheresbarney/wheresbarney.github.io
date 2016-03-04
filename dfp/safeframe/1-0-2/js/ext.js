(function() {
  var d = this,
    g = function(a) {
      var b = typeof a;
      if ("object" == b)
        if (a) {
          if (a instanceof Array) return "array";
          if (a instanceof Object) return b;
          var c = Object.prototype.toString.call(a);
          if ("[object Window]" == c) return "object";
          if ("[object Array]" == c || "number" == typeof a.length &&
            "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable &&
            !a.propertyIsEnumerable("splice")) return "array";
          if ("[object Function]" == c || "undefined" != typeof a.call &&
            "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable(
              "call")) return "function"
        } else return "null";
      else if ("function" == b && "undefined" == typeof a.call) return
        "object";
      return b
    },
    h = function(a) {
      return "string" == typeof a
    },
    l = function(a) {
      return "boolean" == typeof a
    },
    m = function(a) {
      return "number" == typeof a
    },
    n = function(a) {
      var b = typeof a;
      return "object" == b && null != a || "function" == b
    },
    aa = function(a, b, c) {
      return a.call.apply(a.bind, arguments)
    },
    ba = function(a, b, c) {
      if (!a) throw Error();
      if (2 < arguments.length) {
        var e = Array.prototype.slice.call(arguments, 2);
        return function() {
          var c = Array.prototype.slice.call(arguments);
          Array.prototype.unshift.apply(c, e);
          return a.apply(b, c)
        }
      }
      return function() {
        return a.apply(b, arguments)
      }
    },
    p = function(a, b, c) {
      p = Function.prototype.bind && -1 != Function.prototype.bind.toString()
        .indexOf("native code") ? aa : ba;
      return p.apply(null, arguments)
    },
    q = function(a, b) {
      var c = a.split("."),
        e = d;
      c[0] in e || !e.execScript || e.execScript("var " + c[0]);
      for (var f; c.length && (f = c.shift());) c.length || void 0 === b ? e[
        f] ? e = e[f] : e = e[f] = {} : e[f] = b
    },
    r = function(a, b) {
      function c() {}
      c.prototype = b.prototype;
      a.H = b.prototype;
      a.prototype = new c;
      a.G = function(a, c, k) {
        for (var L = Array(arguments.length - 2), E = 2; E < arguments.length; E++)
          L[E - 2] = arguments[E];
        return b.prototype[c].apply(a, L)
      }
    };
  Function.prototype.bind = Function.prototype.bind || function(a, b) {
    if (1 < arguments.length) {
      var c = Array.prototype.slice.call(arguments, 1);
      c.unshift(this, a);
      return p.apply(null, c)
    }
    return p(this, a)
  };
  var ca = String.prototype.trim ? function(a) {
      return a.trim()
    } : function(a) {
      return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
    },
    t = function(a, b) {
      return a < b ? -1 : a > b ? 1 : 0
    };
  var u = function(a, b, c, e) {
    this.top = a;
    this.right = b;
    this.bottom = c;
    this.left = e
  };
  u.prototype.clone = function() {
    return new u(this.top, this.right, this.bottom, this.left)
  };
  var da = function(a) {
      this.e = a;
      this.j = null;
      this.d = this.a = 0;
      this.f = null;
      this.q = "sfchannel" + a
    },
    v = function(a) {
      return 1 == a.a || 2 == a.a
    };
  var w = function(a) {
      a = String(a);
      if (/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(
        /\\["\\\/bfnrtu]/g, "@").replace(
        /"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""))) try {
        return eval("(" + a + ")")
      } catch (b) {}
      throw Error("Invalid JSON string: " + a);
    },
    x = function(a) {
      return (new ea(void 0)).g(a)
    },
    ea = function(a) {
      this.a = a
    };
  ea.prototype.g = function(a) {
    var b = [];
    y(this, a, b);
    return b.join("")
  };
  var y = function(a, b, c) {
      switch (typeof b) {
        case "string":
          fa(b, c);
          break;
        case "number":
          c.push(isFinite(b) && !isNaN(b) ? b : "null");
          break;
        case "boolean":
          c.push(b);
          break;
        case "undefined":
          c.push("null");
          break;
        case "object":
          if (null == b) {
            c.push("null");
            break
          }
          if ("array" == g(b)) {
            var e = b.length;
            c.push("[");
            for (var f = "", k = 0; k < e; k++) c.push(f), f = b[k], y(a, a.a ?
              a.a.call(b, String(k), f) : f, c), f = ",";
            c.push("]");
            break
          }
          c.push("{");
          e = "";
          for (k in b) Object.prototype.hasOwnProperty.call(b, k) && (f = b[k],
            "function" != typeof f && (c.push(e), fa(k, c), c.push(":"), y(
              a, a.a ? a.a.call(b, k, f) : f, c), e = ","));
          c.push("}");
          break;
        case "function":
          break;
        default:
          throw Error("Unknown type: " + typeof b);
      }
    },
    z = {
      '"': '\\"',
      "\\": "\\\\",
      "/": "\\/",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "\t": "\\t",
      "\x0B": "\\u000b"
    },
    ga = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g :
    /[\\\"\x00-\x1f\x7f-\xff]/g,
    fa = function(a, b) {
      b.push('"', a.replace(ga, function(a) {
        if (a in z) return z[a];
        var b = a.charCodeAt(0),
          f = "\\u";
        16 > b ? f += "000" : 256 > b ? f += "00" : 4096 > b && (f +=
          "0");
        return z[a] = f + b.toString(16)
      }), '"')
    };
  var A = function(a, b) {
    var c = window;
    c.addEventListener ? c.addEventListener(a, b, !1) : c.attachEvent && c.attachEvent(
      "on" + a, b)
  };
  var B = function(a, b, c, e) {
    this.j = a;
    this.f = 1;
    this.e = b;
    this.m = c;
    this.u = e;
    this.k = Math.random();
    this.a = {};
    this.d = null;
    this.o = p(this.q, this)
  };
  B.prototype.q = function(a) {
    if (a.origin == this.m && a.source == this.e) {
      var b = null;
      try {
        b = w(a.data)
        console.warn(b);
      } catch (c) {}
      if (n(b) && (a = b.i, b.c === this.j && a != this.k && (2 != this.f &&
        (this.f = 2, ha(this), this.d && (this.d(), this.d = null)), a =
        b.s, b = b.p, h(a) && (h(b) || n(b)) && this.a.hasOwnProperty(a)
      ))) this.a[a](b)
    }
  };
  var ha = function(a) {
    var b = {};
    b.c = a.j;
    b.i = a.k;
    a.e.postMessage(x(b), a.m)
  };
  B.prototype.n = function() {
    if (1 == this.f) {
      try {
        this.e.postMessage && ha(this)
      } catch (a) {}
      window.setTimeout(p(this.n, this), 50)
    }
  };
  B.prototype.send = function(a, b) {
    var c = {};
    c.c = this.j;
    c.i = this.k;
    c.s = a;
    c.p = b;
    this.e.postMessage(x(c), this.m)
  };
  var C = function(a, b) {
    this.width = a;
    this.height = b
  };
  C.prototype.clone = function() {
    return new C(this.width, this.height)
  };
  var D;
  t: {
    var ia = d.navigator;
    if (ia) {
      var ja = ia.userAgent;
      if (ja) {
        D = ja;
        break t
      }
    }
    D = ""
  };
  var ka = -1 != D.indexOf("Opera") || -1 != D.indexOf("OPR"),
    F = -1 != D.indexOf("Trident") || -1 != D.indexOf("MSIE"),
    G = -1 != D.indexOf("Gecko") && -1 == D.toLowerCase().indexOf("webkit") &&
    !(-1 != D.indexOf("Trident") || -1 != D.indexOf("MSIE")),
    la = -1 != D.toLowerCase().indexOf("webkit"),
    ma = function() {
      var a = d.document;
      return a ? a.documentMode : void 0
    },
    na = function() {
      var a = "",
        b;
      if (ka && d.opera) return a = d.opera.version, "function" == g(a) ? a() :
        a;
      G ? b = /rv\:([^\);]+)(\)|;)/ : F ? b =
        /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/ : la && (b = /WebKit\/(\S+)/);
      b && (a = (a = b.exec(D)) ? a[1] : "");
      return F && (b = ma(), b > parseFloat(a)) ? String(b) : a
    }(),
    oa = {},
    pa = function(a) {
      if (!oa[a]) {
        for (var b = 0, c = ca(String(na)).split("."), e = ca(String(a)).split(
          "."), f = Math.max(c.length, e.length), k = 0; 0 == b && k < f; k++) {
          var L = c[k] || "",
            E = e[k] || "",
            Oa = RegExp("(\\d*)(\\D*)", "g"),
            Pa = RegExp("(\\d*)(\\D*)", "g");
          do {
            var I = Oa.exec(L) || ["", "", ""],
              J = Pa.exec(E) || ["", "", ""];
            if (0 == I[0].length && 0 == J[0].length) break;
            b = t(0 == I[1].length ? 0 : parseInt(I[1], 10), 0 == J[1].length ?
                0 : parseInt(J[1], 10)) || t(0 == I[2].length, 0 == J[2].length) ||
              t(I[2], J[2])
          } while (0 == b)
        }
        oa[a] = 0 <= b
      }
    },
    qa = d.document,
    ra = qa && F ? ma() || ("CSS1Compat" == qa.compatMode ? parseInt(na, 10) :
      5) : void 0;
  var sa;
  if (!(sa = !G && !F)) {
    var ta;
    if (ta = F) ta = F && 9 <= ra;
    sa = ta
  }
  sa || G && pa("1.9.1");
  F && pa("9");
  var ua = function(a, b, c, e, f, k) {
    this.d = a.clone();
    this.a = b.clone();
    this.k = c;
    this.e = e.clone();
    this.f = f;
    this.j = k
  };
  ua.prototype.g = function() {
    return x({
      windowCoords_t: this.d.top,
      windowCoords_r: this.d.right,
      windowCoords_b: this.d.bottom,
      windowCoords_l: this.d.left,
      frameCoords_t: this.a.top,
      frameCoords_r: this.a.right,
      frameCoords_b: this.a.bottom,
      frameCoords_l: this.a.left,
      styleZIndex: this.k,
      allowedExpansion_t: this.e.top,
      allowedExpansion_r: this.e.right,
      allowedExpansion_b: this.e.bottom,
      allowedExpansion_l: this.e.left,
      xInView: this.f,
      yInView: this.j
    })
  };
  var va = function(a) {
    a = w(a);
    if (!(n(a) && m(a.windowCoords_t) && m(a.windowCoords_r) && m(a.windowCoords_b) &&
      m(a.windowCoords_l) && m(a.frameCoords_t) && m(a.frameCoords_r) &&
      m(a.frameCoords_b) && m(a.frameCoords_l) && h(a.styleZIndex) && m(a
        .allowedExpansion_t) && m(a.allowedExpansion_r) && m(a.allowedExpansion_b) &&
      m(a.allowedExpansion_l) && m(a.xInView) && 0 <= a.xInView && 1 >= a
      .xInView && m(a.yInView) && 0 <= a.yInView && 1 >= a.yInView)) throw Error(
      "Cannot parse JSON geometry");
    return new ua(new u(a.windowCoords_t, a.windowCoords_r, a.windowCoords_b,
      a.windowCoords_l), new u(a.frameCoords_t, a.frameCoords_r, a.frameCoords_b,
      a.frameCoords_l), a.styleZIndex, new u(a.allowedExpansion_t, a.allowedExpansion_r,
      a.allowedExpansion_b, a.allowedExpansion_l), a.xInView, a.yInView)
  };
  var H = !1,
    K = function(a) {
      if (a = a.match(/[\d]+/g)) a.length = 3
    };
  if (navigator.plugins && navigator.plugins.length) {
    var wa = navigator.plugins["Shockwave Flash"];
    wa && (H = !0, wa.description && K(wa.description));
    navigator.plugins["Shockwave Flash 2.0"] && (H = !0)
  } else if (navigator.mimeTypes && navigator.mimeTypes.length) {
    var xa = navigator.mimeTypes["application/x-shockwave-flash"];
    (H = xa && xa.enabledPlugin) && K(xa.enabledPlugin.description)
  } else try {
    var M = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"),
      H = !0;
    K(M.GetVariable("$version"))
  } catch (ya) {
    try {
      M = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"),
        H = !0
    } catch (za) {
      try {
        M = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"), H = !0, K(M
          .GetVariable("$version"))
      } catch (Aa) {}
    }
  };
  var Ba = function(a) {
    this.a = a
  };
  Ba.prototype.g = function() {
    return x(this.a)
  };
  var Ca = function(a, b, c, e) {
    this.a = a;
    this.d = b;
    this.e = c;
    this.f = e
  };
  Ca.prototype.g = function() {
    return x({
      expandByOverlay: this.a,
      expandByPush: this.d,
      readCookie: this.e,
      writeCookie: this.f
    })
  };
  var Da = function(a, b, c, e, f, k) {
    this.k = a;
    this.a = b;
    this.d = c;
    this.f = e;
    this.e = f;
    this.j = k
  };
  Da.prototype.g = function() {
    var a = {
      uid: this.k,
      hostPeerName: this.a,
      initialGeometry: this.d.g(),
      permissions: this.f.g(),
      metadata: this.e.g(),
      reportCreativeGeometry: this.j
    };
    return x(a)
  };
  var Ea = /^([^;]+);(\d+);([\s\S]*)$/;
  var N = function(a) {
      this.a = a
    },
    Fa = function(a, b) {
      this.a = a;
      this.version = b
    };
  r(Fa, N);
  Fa.prototype.g = function() {
    return x({
      uid: this.a,
      version: this.version
    })
  };
  var Ga = function(a, b, c) {
    this.a = a;
    this.e = b;
    this.d = c
  };
  r(Ga, N);
  Ga.prototype.g = function() {
    return x({
      uid: this.a,
      initialWidth: this.e,
      initialHeight: this.d
    })
  };
  var Ha = function(a, b) {
    this.a = a;
    this.description = b
  };
  r(Ha, N);
  Ha.prototype.g = function() {
    return x({
      uid: this.a,
      description: this.description
    })
  };
  var Ia = function(a, b) {
    this.a = a;
    this.d = b
  };
  r(Ia, N);
  Ia.prototype.g = function() {
    return x({
      uid: this.a,
      expand_t: this.d.top,
      expand_r: this.d.right,
      expand_b: this.d.bottom,
      expand_l: this.d.left
    })
  };
  var Ja = function(a) {
    this.a = a
  };
  r(Ja, N);
  Ja.prototype.g = function() {
    return x({
      uid: this.a
    })
  };
  var O = function(a, b) {
    this.a = a;
    this.e = b
  };
  r(O, N);
  O.prototype.g = function() {
    var a = {
      uid: this.a,
      newGeometry: this.e.g()
    };
    return x(a)
  };
  var Ka = function(a) {
      a = w(a);
      if (!(n(a) && m(a.uid) && h(a.newGeometry))) throw Error(
        "Cannot parse JSON message");
      var b = va(a.newGeometry);
      return new O(a.uid, b)
    },
    La = function(a, b, c, e) {
      O.call(this, a, c);
      this.f = b;
      this.d = e
    };
  r(La, O);
  La.prototype.g = function() {
    var a = {
      uid: this.a,
      success: this.f,
      newGeometry: this.e.g(),
      expand_t: this.d.top,
      expand_r: this.d.right,
      expand_b: this.d.bottom,
      expand_l: this.d.left
    };
    return x(a)
  };
  var Ma = function(a, b, c) {
    this.a = a;
    this.width = b;
    this.height = c
  };
  r(Ma, N);
  Ma.prototype.g = function() {
    return x({
      uid: this.a,
      width: this.width,
      height: this.height
    })
  };
  var Q = function(a) {
    da.call(this, a.k);
    this.n = a.f;
    this.v = a.e;
    this.o = null;
    this.m = [];
    this.k = 0;
    this.j = a.d;
    this.f = new B(this.q, window.parent, a.a, !0);
    var b = p(this.A, this);
    this.f.a.expand_response = b;
    b = p(this.u, this);
    this.f.a.collapse_response = b;
    b = p(this.B, this);
    this.f.a.geometry_update = b;
    var b = this.f,
      c = p(this.C, this);
    c && (b.d = c);
    A("message", b.o);
    b.u && b.n();
    this.a = 1;
    P(this, "init_done", new Fa(this.e, "1-0-2"));
    a.j && (a = p(Q.prototype.D, this), A("load", a), A("resize", a))
  };
  r(Q, da);
  var R = function(a, b) {
    P(a, "report_error", new Ha(a.e, b))
  };
  Q.prototype.C = function() {
    for (var a = 0; a < this.m.length; a++) this.f.send(this.m[a].type,
      this.m[a].message.g())
  };
  Q.prototype.A = function(a) {
    try {
      if (2 != this.a) throw Error("Container is not registered");
      if (3 != this.d) throw Error("Container is not expanding");
      if (!h(a)) throw Error("Could not parse serialized message");
      var b, c = w(a);
      if (!(n(c) && m(c.uid) && l(c.success) && h(c.newGeometry) && m(c.expand_t) &&
        m(c.expand_r) && m(c.expand_b) && m(c.expand_l))) throw Error(
        "Cannot parse JSON message");
      var e = va(c.newGeometry);
      b = new La(c.uid, c.success, e, new u(c.expand_t, c.expand_r, c.expand_b,
        c.expand_l));
      if (this.e != b.a) throw Error("Wrong source container");
      this.d = b.f ? 2 : 0;
      this.j = b.e;
      S(this, b.f ? "expanded" : "failed", "exp-ovr", "", {
        t: b.d.top,
        r: b.d.right,
        b: b.d.bottom,
        l: b.d.left,
        push: !1
      })
    } catch (f) {}
  };
  Q.prototype.u = function(a) {
    try {
      if (2 != this.a) throw Error("Container is not registered");
      if (1 != this.d) throw Error("Container is not collapsing");
      if (!h(a)) throw Error("Could not parse serialized message");
      var b = Ka(a);
      if (this.e != b.a) throw Error("Wrong source container");
      this.d = 0;
      this.j = b.e;
      S(this, "collapsed", "collapse", "", void 0)
    } catch (c) {}
  };
  Q.prototype.B = function(a) {
    try {
      if (!v(this)) throw Error(
        "Container is not initialized or registered");
      if (!h(a)) throw Error("Could not parse serialized message");
      var b = Ka(a);
      if (this.e != b.a) throw Error("Wrong source container");
      this.j = b.e;
      S(this, "geom-update", "", "", void 0)
    } catch (c) {}
  };
  var S = function(a, b, c, e, f) {
      if (null !== a.o) try {
        a.o(b, {
          cmd: c,
          reason: e,
          info: f
        })
      } catch (k) {
        R(a, "Could not manage to call user-supplied callback")
      }
    },
    U = function(a, b, c) {
      setTimeout(p(function() {
        S(this, "failed", a, b, c)
      }, T), 0)
    },
    P = function(a, b, c) {
      2 == a.f.f ? a.f.send(b, c.g()) : a.m.push({
        type: b,
        message: c
      })
    },
    Na = function(a) {
      var b = new C(document.body.offsetWidth, document.body.offsetHeight);
      P(a, "creative_geometry_update", new Ma(a.e, b.width, b.height))
    };
  Q.prototype.F = function() {
    2 == this.k && Na(this);
    this.k = 0
  };
  Q.prototype.D = function() {
    switch (this.k) {
      case 0:
        Na(this);
        setTimeout(p(Q.prototype.F, this), 200);
        this.k = 1;
        break;
      case 1:
        this.k = 2
    }
  };
  var T = null,
    Qa = function(a, b, c) {
      if (2 == T.a) R(T, "Called register multiple times");
      else if (!m(a) || 0 >= a) R(T, "Invalid initial width");
      else if (!m(b) || 0 >= b) R(T, "Invalid initial height");
      else {
        var e = null;
        if (null != c) {
          if ("function" != g(c)) {
            R(T, "Invalid callback function");
            return
          }
          e = c
        }
        c = T;
        c.a = 2;
        c.o = e;
        P(c, "register_done", new Ga(c.e, a, b))
      }
    },
    Ra = function() {
      return v(T) ? {
        "exp-ovr": T.n.a,
        "exp-push": T.n.d,
        "read-cookie": T.n.e,
        "write-cookie": T.n.f
      } : (R(T, "Called supports on bad container"), null)
    },
    Sa = function() {
      if (!v(T)) return R(T, "Called geom on bad container"), null;
      var a = T.j;
      return {
        win: {
          t: a.d.top,
          r: a.d.right,
          b: a.d.bottom,
          l: a.d.left,
          w: a.d.right - a.d.left,
          h: a.d.bottom - a.d.top
        },
        self: {
          t: a.a.top,
          r: a.a.right,
          b: a.a.bottom,
          l: a.a.left,
          w: a.a.right - a.a.left,
          h: a.a.bottom - a.a.top,
          z: parseInt(a.k, 10),
          xiv: a.f,
          yiv: a.j,
          iv: a.f * a.j
        },
        exp: {
          t: a.e.top,
          r: a.e.right,
          b: a.e.bottom,
          l: a.e.left,
          xs: !1,
          yx: !1
        }
      }
    },
    Ta = function() {
      if (!v(T)) return R(T, "Called inViewPercentage on bad container"),
        null;
      var a = T.j;
      return a.f * a.j * 100
    },
    Ua = function() {
      if (!v(T)) return R(T, "Called status on bad container"), null;
      switch (T.d) {
        case 0:
          return "collapsed";
        case 1:
          return "collapsing";
        case 2:
          return "expanded";
        case 3:
          return "expanding";
        default:
          return null
      }
    },
    Va = function(a, b) {
      if (!v(T)) return R(T, "Called meta on bad container"), null;
      if (!h(a) || /^[\s\xa0]*$/.test(null == a ? "" : String(a))) return R(T,
        "Invalid property name"), null;
      var c = "shared";
      if (null != b) {
        if (!h(b) || /^[\s\xa0]*$/.test(null == b ? "" : String(b))) return R(
          T, "Invalid owner key"), null;
        c = b
      }
      var e = T.v;
      return null != e.a[c] && null != e.a[c][a] ? e.a[c][a] : null
    },
    Wa = function(a, b) {
      if (2 == T.a)
        if (!h(a) || /^[\s\xa0]*$/.test(a)) R(T, "Invalid cookie name");
        else {
          if (null != b) {
            var c;
            !(c = !n(b) || !h(b.info)) && (c = null != b.expires) && (c = b.expires,
              c = !(n(c) && "function" == typeof c.getFullYear));
            if (c) {
              U("write-cookie", "Invalid $sf.ext.cookie arguments", b);
              R(T, "Invalid cookie data");
              return
            }
          }
          U(null != b ? "write-cookie" : "read-cookie",
            "$sf.ext.cookie is not supported", b);
          R(T, "Used unsupported cookie operations")
        } else R(T, "Called cookie on unregistered container")
    },
    Xa = function(a) {
      if (2 == T.a)
        if (0 == T.d)
          if (n(a) && (null != a.t || null != a.r || null != a.b || null != a
            .l) && (null == a.t || m(a.t) && 0 <= a.t) && (null == a.r || m(
            a.r) && 0 <= a.r) && (null == a.b || m(a.b) && 0 <= a.b) && (
            null == a.l || m(a.l) && 0 <= a.l) && (null == a.push || l(a.push)))
            if (null != a.push && a.push) U("exp-push",
              "$sf.ext.expand with push expansion is not supported", a), R(
              T, "Push expansion is not supported");
            else {
              a = new u(a.t || 0, a.r || 0, a.b || 0, a.l || 0);
              var b = T;
              b.d = 3;
              P(b, "expand_request", new Ia(b.e, a))
            } else U(n(a) && l(a.push) && 1 == a.push ? "exp-push" :
        "exp-ovr", "Invalid $sf.ext.expand arguments", a), R(T,
        "Invalid expand data");
      else R(T, "Called expand on uncollapsed container");
      else R(T, "Called expand on unregistered container")
    },
    Ya = function() {
      if (2 == T.a)
        if (2 == T.d) {
          var a = T;
          a.d = 1;
          P(a, "collapse_request", new Ja(a.e))
        } else R(T, "Called collapse on unexpanded container");
      else R(T, "Called collapse on unregistered container")
    },
    V = window;
  if (V != V.parent && V.parent == V.top) {
    try {
      var Za = window.name,
        $a = Ea.exec(Za);
      if (null === $a) throw Error(
        "Cannot parse serialized data to extract version string");
      if ("1-0-2" != $a[1]) throw Error(
        "Host has different version from ext container");
      var W = Ea.exec(Za);
      if (null === W) throw Error(
        "Cannot parse serialized data to extract config");
      var ab = parseInt(W[2], 10);
      if (ab > W[3].length) throw Error(
        "Cannot parse serialized data to extract content");
      var X = w(W[3].substring(ab));
      if (!(n(X) && m(X.uid) && h(X.hostPeerName) && h(X.initialGeometry) &&
        h(X.permissions) && h(X.metadata) && l(X.reportCreativeGeometry)))
        throw Error("Cannot parse JSON config");
      var bb = va(X.initialGeometry),
        cb, Y = w(X.permissions);
      if (!(n(Y) && l(Y.expandByOverlay) && l(Y.expandByPush) && l(Y.readCookie) &&
        l(Y.writeCookie))) throw Error("Cannot parse JSON permissions");
      cb = new Ca(Y.expandByOverlay, Y.expandByPush, Y.readCookie, Y.writeCookie);
      var Z = w(X.metadata);
      if (!(n(Z) && n(Z.shared) && h(Z.shared.sf_ver) && m(Z.shared.ck_on) &&
        h(Z.shared.flash_ver))) throw Error("Cannot parse JSON metadata");
      T = new Q(new Da(X.uid, X.hostPeerName, bb, cb, new Ba({
        shared: {
          sf_ver: Z.shared.sf_ver,
          ck_on: Z.shared.ck_on,
          flash_ver: Z.shared.flash_ver
        }
      }), X.reportCreativeGeometry));
      q("$sf.ext.register", Qa);
      q("$sf.ext.supports", Ra);
      q("$sf.ext.geom", Sa);
      q("$sf.ext.inViewPercentage", Ta);
      q("$sf.ext.status", Ua);
      q("$sf.ext.meta", Va);
      q("$sf.ext.cookie", Wa);
      q("$sf.ext.expand", Xa);
      q("$sf.ext.collapse", Ya)
    } catch (db) {}
    window.name = ""
  };
})();