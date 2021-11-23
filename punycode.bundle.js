/* esm.sh - esbuild bundle(punycode@1.3.2) deno production */
var __global$ = globalThis || (typeof window !== "undefined" ? window : self);
var oe = Object.create;
var L = Object.defineProperty;
var ne = Object.getOwnPropertyDescriptor;
var re = Object.getOwnPropertyNames;
var te = Object.getPrototypeOf, ie = Object.prototype.hasOwnProperty;
var fe = (i) => L(i, "__esModule", { value: !0 });
var ue = (i, a) => () => (a || i((a = { exports: {} }).exports, a), a.exports);
var ae = (i, a, M) => {
    if (a && typeof a == "object" || typeof a == "function") {
      for (let s of re(a)) {
        !ie.call(i, s) && s !== "default" && L(i, s, {
          get: () => a[s],
          enumerable: !(M = ne(a, s)) || M.enumerable,
        });
      }
    }
    return i;
  },
  ce = (i) =>
    ae(
      fe(L(
        i != null ? oe(te(i)) : {},
        "default",
        i && i.__esModule && "default" in i
          ? { get: () => i.default, enumerable: !0 }
          : { value: i, enumerable: !0 },
      )),
      i,
    );
var K = ue((I, j) => {
  (function (i) {
    var a = typeof I == "object" && I && !I.nodeType && I,
      M = typeof j == "object" && j && !j.nodeType && j,
      s = typeof __global$ == "object" && __global$;
    (s.global === s || s.window === s || s.self === s) && (i = s);
    var w,
      m = 2147483647,
      x = 36,
      D = 1,
      A = 26,
      P = 38,
      Q = 700,
      O = 72,
      B = 128,
      q = "-",
      W = /^xn--/,
      X = /[^\x20-\x7E]/,
      Y = /[\x2E\u3002\uFF0E\uFF61]/g,
      Z = {
        overflow: "Overflow: input needs wider integers to process",
        "not-basic": "Illegal input >= 0x80 (not a basic code point)",
        "invalid-input": "Invalid input",
      },
      E = x - D,
      b = Math.floor,
      T = String.fromCharCode,
      k;
    function g(e) {
      throw RangeError(Z[e]);
    }
    function N(e, o) {
      for (var n = e.length, r = []; n--;) r[n] = o(e[n]);
      return r;
    }
    function U(e, o) {
      var n = e.split("@"), r = "";
      n.length > 1 && (r = n[0] + "@", e = n[1]), e = e.replace(Y, ".");
      var t = e.split("."), c = N(t, o).join(".");
      return r + c;
    }
    function G(e) {
      for (var o = [], n = 0, r = e.length, t, c; n < r;) {
        t = e.charCodeAt(n++),
          t >= 55296 && t <= 56319 && n < r
            ? (c = e.charCodeAt(n++),
              (c & 64512) == 56320
                ? o.push(((t & 1023) << 10) + (c & 1023) + 65536)
                : (o.push(t), n--))
            : o.push(t);
      }
      return o;
    }
    function R(e) {
      return N(e, function (o) {
        var n = "";
        return o > 65535 &&
          (o -= 65536, n += T(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023),
          n += T(o),
          n;
      }).join("");
    }
    function _(e) {
      return e - 48 < 10
        ? e - 22
        : e - 65 < 26
        ? e - 65
        : e - 97 < 26
        ? e - 97
        : x;
    }
    function V(e, o) {
      return e + 22 + 75 * (e < 26) - ((o != 0) << 5);
    }
    function z(e, o, n) {
      var r = 0;
      for (e = n ? b(e / Q) : e >> 1, e += b(e / o); e > E * A >> 1; r += x) {
        e = b(e / E);
      }
      return b(r + (E + 1) * e / (e + P));
    }
    function H(e) {
      var o = [],
        n = e.length,
        r,
        t = 0,
        c = B,
        f = O,
        l,
        p,
        v,
        C,
        u,
        d,
        h,
        F,
        y;
      for (l = e.lastIndexOf(q), l < 0 && (l = 0), p = 0; p < l; ++p) {
        e.charCodeAt(p) >= 128 && g("not-basic"), o.push(e.charCodeAt(p));
      }
      for (v = l > 0 ? l + 1 : 0; v < n;) {
        for (
          C = t, u = 1, d = x;
          v >= n && g("invalid-input"),
            h = _(e.charCodeAt(v++)),
            (h >= x || h > b((m - t) / u)) && g("overflow"),
            t += h * u,
            F = d <= f ? D : d >= f + A ? A : d - f,
            !(h < F);
          d += x
        ) {
          y = x - F, u > b(m / y) && g("overflow"), u *= y;
        }
        r = o.length + 1,
          f = z(t - C, r, C == 0),
          b(t / r) > m - c && g("overflow"),
          c += b(t / r),
          t %= r,
          o.splice(t++, 0, c);
      }
      return R(o);
    }
    function J(e) {
      var o, n, r, t, c, f, l, p, v, C, u, d = [], h, F, y, S;
      for (e = G(e), h = e.length, o = B, n = 0, c = O, f = 0; f < h; ++f) {
        u = e[f], u < 128 && d.push(T(u));
      }
      for (r = t = d.length, t && d.push(q); r < h;) {
        for (l = m, f = 0; f < h; ++f) u = e[f], u >= o && u < l && (l = u);
        for (
          F = r + 1,
            l - o > b((m - n) / F) && g("overflow"),
            n += (l - o) * F,
            o = l,
            f = 0;
          f < h;
          ++f
        ) {
          if (u = e[f], u < o && ++n > m && g("overflow"), u == o) {
            for (
              p = n, v = x;
              C = v <= c ? D : v >= c + A ? A : v - c, !(p < C);
              v += x
            ) {
              S = p - C, y = x - C, d.push(T(V(C + S % y, 0))), p = b(S / y);
            }
            d.push(T(V(p, 0))), c = z(n, F, r == t), n = 0, ++r;
          }
        }
        ++n, ++o;
      }
      return d.join("");
    }
    function $(e) {
      return U(e, function (o) {
        return W.test(o) ? H(o.slice(4).toLowerCase()) : o;
      });
    }
    function ee(e) {
      return U(e, function (o) {
        return X.test(o) ? "xn--" + J(o) : o;
      });
    }
    if (
      w = {
        version: "1.3.2",
        ucs2: { decode: G, encode: R },
        decode: H,
        encode: J,
        toASCII: ee,
        toUnicode: $,
      },
        typeof define == "function" && typeof define.amd == "object" &&
        define.amd
    ) {
      define("punycode", function () {
        return w;
      });
    } else if (a && M) {
      if (j.exports == a) M.exports = w;
      else for (k in w) w.hasOwnProperty(k) && (a[k] = w[k]);
    } else i.punycode = w;
  })(I);
});
var se = ce(K());
var export_default = se.default;
export { export_default as default };
/*! https://mths.be/punycode v1.3.2 by @mathias */
