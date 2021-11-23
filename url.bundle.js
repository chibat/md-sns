/* esm.sh - esbuild bundle(url@0.11.0) deno production */
import __querystring$ from "https://deno.land/std@0.115.0/node/querystring.ts";
import __punycode$ from "/v58/punycode@1.3.2/deno/punycode.bundle.js";
var k = Object.create;
var T = Object.defineProperty;
var E = Object.getOwnPropertyDescriptor;
var tt = Object.getOwnPropertyNames;
var st = Object.getPrototypeOf, ht = Object.prototype.hasOwnProperty;
var et = (t) => T(t, "__esModule", { value: !0 });
var D =
  ((t) =>
    typeof require != "undefined"
      ? require
      : typeof Proxy != "undefined"
      ? new Proxy(t, {
        get: (e, s) => (typeof require != "undefined" ? require : e)[s],
      })
      : t)(function (t) {
      if (typeof require != "undefined") return require.apply(this, arguments);
      throw new Error('Dynamic require of "' + t + '" is not supported');
    });
var G = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports);
var rt = (t, e, s) => {
    if (e && typeof e == "object" || typeof e == "function") {
      for (let o of tt(e)) {
        !ht.call(t, o) && o !== "default" && T(t, o, {
          get: () => e[o],
          enumerable: !(s = E(e, o)) || s.enumerable,
        });
      }
    }
    return t;
  },
  J = (t) =>
    rt(
      et(T(
        t != null ? k(st(t)) : {},
        "default",
        t && t.__esModule && "default" in t
          ? { get: () => t.default, enumerable: !0 }
          : { value: t, enumerable: !0 },
      )),
      t,
    );
var V = G((xt, K) => {
  "use strict";
  K.exports = {
    isString: function (t) {
      return typeof t == "string";
    },
    isObject: function (t) {
      return typeof t == "object" && t !== null;
    },
    isNull: function (t) {
      return t === null;
    },
    isNullOrUndefined: function (t) {
      return t == null;
    },
  };
});
var B = G((P) => {
  "use strict";
  var ot = __punycode$, b = V();
  P.parse = w;
  P.resolve = gt;
  P.resolveObject = yt;
  P.format = mt;
  P.Url = p;
  function p() {
    this.protocol = null,
      this.slashes = null,
      this.auth = null,
      this.host = null,
      this.port = null,
      this.hostname = null,
      this.hash = null,
      this.search = null,
      this.query = null,
      this.pathname = null,
      this.path = null,
      this.href = null;
  }
  var at = /^([a-z0-9.+-]+:)/i,
    nt = /:[0-9]*$/,
    it = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
    ft = [
      "<",
      ">",
      '"',
      "`",
      " ",
      "\r",
      `
`,
      "	",
    ],
    ut = ["{", "}", "|", "\\", "^", "`"].concat(ft),
    Z = ["'"].concat(ut),
    W = ["%", "/", "?", ";", "#"].concat(Z),
    X = ["/", "?", "#"],
    ct = 255,
    Y = /^[+a-z0-9A-Z_-]{0,63}$/,
    lt = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    pt = { javascript: !0, "javascript:": !0 },
    F = { javascript: !0, "javascript:": !0 },
    C = {
      http: !0,
      https: !0,
      ftp: !0,
      gopher: !0,
      file: !0,
      "http:": !0,
      "https:": !0,
      "ftp:": !0,
      "gopher:": !0,
      "file:": !0,
    },
    M = __querystring$;
  function w(t, e, s) {
    if (t && b.isObject(t) && t instanceof p) return t;
    var o = new p();
    return o.parse(t, e, s), o;
  }
  p.prototype.parse = function (t, e, s) {
    if (!b.isString(t)) {
      throw new TypeError("Parameter 'url' must be a string, not " + typeof t);
    }
    var o = t.indexOf("?"),
      i = o !== -1 && o < t.indexOf("#") ? "?" : "#",
      y = t.split(i),
      l = /\\/g;
    y[0] = y[0].replace(l, "/"), t = y.join(i);
    var h = t;
    if (h = h.trim(), !s && t.split("#").length === 1) {
      var d = it.exec(h);
      if (d) {
        return this.path = h,
          this.href = h,
          this.pathname = d[1],
          d[2]
            ? (this.search = d[2],
              e
                ? this.query = M.parse(this.search.substr(1))
                : this.query = this.search.substr(1))
            : e && (this.search = "", this.query = {}),
          this;
      }
    }
    var u = at.exec(h);
    if (u) {
      u = u[0];
      var A = u.toLowerCase();
      this.protocol = A, h = h.substr(u.length);
    }
    if (s || u || h.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      var U = h.substr(0, 2) === "//";
      U && !(u && F[u]) && (h = h.substr(2), this.slashes = !0);
    }
    if (!F[u] && (U || u && !C[u])) {
      for (var f = -1, a = 0; a < X.length; a++) {
        var x = h.indexOf(X[a]);
        x !== -1 && (f === -1 || x < f) && (f = x);
      }
      var I, c;
      f === -1 ? c = h.lastIndexOf("@") : c = h.lastIndexOf("@", f),
        c !== -1 &&
        (I = h.slice(0, c),
          h = h.slice(c + 1),
          this.auth = decodeURIComponent(I)),
        f = -1;
      for (var a = 0; a < W.length; a++) {
        var x = h.indexOf(W[a]);
        x !== -1 && (f === -1 || x < f) && (f = x);
      }
      f === -1 && (f = h.length),
        this.host = h.slice(0, f),
        h = h.slice(f),
        this.parseHost(),
        this.hostname = this.hostname || "";
      var R = this.hostname[0] === "[" &&
        this.hostname[this.hostname.length - 1] === "]";
      if (!R) {
        for (
          var r = this.hostname.split(/\./), a = 0, n = r.length;
          a < n;
          a++
        ) {
          var q = r[a];
          if (!!q && !q.match(Y)) {
            for (
              var m = "", g = 0, $ = q.length;
              g < $;
              g++
            ) {
              q.charCodeAt(g) > 127 ? m += "x" : m += q[g];
            }
            if (!m.match(Y)) {
              var j = r.slice(0, a), O = r.slice(a + 1), v = q.match(lt);
              v && (j.push(v[1]), O.unshift(v[2])),
                O.length && (h = "/" + O.join(".") + h),
                this.hostname = j.join(".");
              break;
            }
          }
        }
      }
      this.hostname.length > ct
        ? this.hostname = ""
        : this.hostname = this.hostname.toLowerCase(),
        R || (this.hostname = ot.toASCII(this.hostname));
      var z = this.port ? ":" + this.port : "", H = this.hostname || "";
      this.host = H + z,
        this.href += this.host,
        R &&
        (this.hostname = this.hostname.substr(1, this.hostname.length - 2),
          h[0] !== "/" && (h = "/" + h));
    }
    if (!pt[A]) {
      for (var a = 0, n = Z.length; a < n; a++) {
        var N = Z[a];
        if (h.indexOf(N) !== -1) {
          var L = encodeURIComponent(N);
          L === N && (L = escape(N)), h = h.split(N).join(L);
        }
      }
    }
    var S = h.indexOf("#");
    S !== -1 && (this.hash = h.substr(S), h = h.slice(0, S));
    var _ = h.indexOf("?");
    if (
      _ !== -1
        ? (this.search = h.substr(_),
          this.query = h.substr(_ + 1),
          e && (this.query = M.parse(this.query)),
          h = h.slice(0, _))
        : e && (this.search = "", this.query = {}),
        h && (this.pathname = h),
        C[A] && this.hostname && !this.pathname && (this.pathname = "/"),
        this.pathname || this.search
    ) {
      var z = this.pathname || "", Q = this.search || "";
      this.path = z + Q;
    }
    return this.href = this.format(), this;
  };
  function mt(t) {
    return b.isString(t) && (t = w(t)),
      t instanceof p ? t.format() : p.prototype.format.call(t);
  }
  p.prototype.format = function () {
    var t = this.auth || "";
    t && (t = encodeURIComponent(t), t = t.replace(/%3A/i, ":"), t += "@");
    var e = this.protocol || "",
      s = this.pathname || "",
      o = this.hash || "",
      i = !1,
      y = "";
    this.host
      ? i = t + this.host
      : this.hostname && (i = t + (this.hostname.indexOf(":") === -1
        ? this.hostname
        : "[" + this.hostname + "]"),
        this.port && (i += ":" + this.port)),
      this.query && b.isObject(this.query) && Object.keys(this.query).length &&
      (y = M.stringify(this.query));
    var l = this.search || y && "?" + y || "";
    return e && e.substr(-1) !== ":" && (e += ":"),
      this.slashes || (!e || C[e]) && i !== !1
        ? (i = "//" + (i || ""), s && s.charAt(0) !== "/" && (s = "/" + s))
        : i || (i = ""),
      o && o.charAt(0) !== "#" && (o = "#" + o),
      l && l.charAt(0) !== "?" && (l = "?" + l),
      s = s.replace(/[?#]/g, function (h) {
        return encodeURIComponent(h);
      }),
      l = l.replace("#", "%23"),
      e + i + s + l + o;
  };
  function gt(t, e) {
    return w(t, !1, !0).resolve(e);
  }
  p.prototype.resolve = function (t) {
    return this.resolveObject(w(t, !1, !0)).format();
  };
  function yt(t, e) {
    return t ? w(t, !1, !0).resolveObject(e) : e;
  }
  p.prototype.resolveObject = function (t) {
    if (b.isString(t)) {
      var e = new p();
      e.parse(t, !1, !0), t = e;
    }
    for (var s = new p(), o = Object.keys(this), i = 0; i < o.length; i++) {
      var y = o[i];
      s[y] = this[y];
    }
    if (s.hash = t.hash, t.href === "") return s.href = s.format(), s;
    if (t.slashes && !t.protocol) {
      for (var l = Object.keys(t), h = 0; h < l.length; h++) {
        var d = l[h];
        d !== "protocol" && (s[d] = t[d]);
      }
      return C[s.protocol] && s.hostname && !s.pathname &&
        (s.path = s.pathname = "/"),
        s.href = s.format(),
        s;
    }
    if (t.protocol && t.protocol !== s.protocol) {
      if (!C[t.protocol]) {
        for (var u = Object.keys(t), A = 0; A < u.length; A++) {
          var U = u[A];
          s[U] = t[U];
        }
        return s.href = s.format(), s;
      }
      if (s.protocol = t.protocol, !t.host && !F[t.protocol]) {
        for (
          var n = (t.pathname || "").split("/");
          n.length && !(t.host = n.shift());
        );
        t.host || (t.host = ""),
          t.hostname || (t.hostname = ""),
          n[0] !== "" && n.unshift(""),
          n.length < 2 && n.unshift(""),
          s.pathname = n.join("/");
      } else s.pathname = t.pathname;
      if (
        s.search = t.search,
          s.query = t.query,
          s.host = t.host || "",
          s.auth = t.auth,
          s.hostname = t.hostname || t.host,
          s.port = t.port,
          s.pathname || s.search
      ) {
        var f = s.pathname || "", a = s.search || "";
        s.path = f + a;
      }
      return s.slashes = s.slashes || t.slashes, s.href = s.format(), s;
    }
    var x = s.pathname && s.pathname.charAt(0) === "/",
      I = t.host || t.pathname && t.pathname.charAt(0) === "/",
      c = I || x || s.host && t.pathname,
      R = c,
      r = s.pathname && s.pathname.split("/") || [],
      n = t.pathname && t.pathname.split("/") || [],
      q = s.protocol && !C[s.protocol];
    if (
      q &&
      (s.hostname = "",
        s.port = null,
        s.host && (r[0] === "" ? r[0] = s.host : r.unshift(s.host)),
        s.host = "",
        t.protocol && (t.hostname = null,
          t.port = null,
          t.host && (n[0] === "" ? n[0] = t.host : n.unshift(t.host)),
          t.host = null),
        c = c && (n[0] === "" || r[0] === "")), I
    ) {
      s.host = t.host || t.host === "" ? t.host : s.host,
        s.hostname = t.hostname || t.hostname === "" ? t.hostname : s.hostname,
        s.search = t.search,
        s.query = t.query,
        r = n;
    } else if (n.length) {
      r || (r = []),
        r.pop(),
        r = r.concat(n),
        s.search = t.search,
        s.query = t.query;
    } else if (!b.isNullOrUndefined(t.search)) {
      if (q) {
        s.hostname = s.host = r.shift();
        var m = s.host && s.host.indexOf("@") > 0 ? s.host.split("@") : !1;
        m && (s.auth = m.shift(), s.host = s.hostname = m.shift());
      }
      return s.search = t.search,
        s.query = t.query,
        (!b.isNull(s.pathname) || !b.isNull(s.search)) &&
        (s.path = (s.pathname ? s.pathname : "") + (s.search ? s.search : "")),
        s.href = s.format(),
        s;
    }
    if (!r.length) {
      return s.pathname = null,
        s.search ? s.path = "/" + s.search : s.path = null,
        s.href = s.format(),
        s;
    }
    for (
      var g = r.slice(-1)[0],
        $ = (s.host || t.host || r.length > 1) && (g === "." || g === "..") ||
          g === "",
        j = 0,
        O = r.length;
      O >= 0;
      O--
    ) {
      g = r[O],
        g === "."
          ? r.splice(O, 1)
          : g === ".."
          ? (r.splice(O, 1), j++)
          : j && (r.splice(O, 1), j--);
    }
    if (!c && !R) for (; j--; j) r.unshift("..");
    c && r[0] !== "" && (!r[0] || r[0].charAt(0) !== "/") && r.unshift(""),
      $ && r.join("/").substr(-1) !== "/" && r.push("");
    var v = r[0] === "" || r[0] && r[0].charAt(0) === "/";
    if (q) {
      s.hostname = s.host = v ? "" : r.length ? r.shift() : "";
      var m = s.host && s.host.indexOf("@") > 0 ? s.host.split("@") : !1;
      m && (s.auth = m.shift(), s.host = s.hostname = m.shift());
    }
    return c = c || s.host && r.length,
      c && !v && r.unshift(""),
      r.length ? s.pathname = r.join("/") : (s.pathname = null, s.path = null),
      (!b.isNull(s.pathname) || !b.isNull(s.search)) &&
      (s.path = (s.pathname ? s.pathname : "") + (s.search ? s.search : "")),
      s.auth = t.auth || s.auth,
      s.slashes = s.slashes || t.slashes,
      s.href = s.format(),
      s;
  };
  p.prototype.parseHost = function () {
    var t = this.host, e = nt.exec(t);
    e &&
    (e = e[0],
      e !== ":" && (this.port = e.substr(1)),
      t = t.substr(0, t.length - e.length)), t && (this.hostname = t);
  };
});
var qt = J(B()),
  Ot = J(B()),
  { parse: jt, resolve: At, resolveObject: vt, format: Ct, Url: Pt } = qt;
var export_default = Ot.default;
export {
  At as resolve,
  Ct as format,
  export_default as default,
  jt as parse,
  Pt as Url,
  vt as resolveObject,
};
