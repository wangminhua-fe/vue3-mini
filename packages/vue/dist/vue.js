var Vue = (function (exports) {
    'use strict';

    /*
     * @Author: Marshall
     * @Date: 2023-09-23 20:13:46
     * @LastEditors: Marshall
     * @LastEditTime: 2023-10-12 07:25:55
     * @Description:
     * @FilePath: /vue3-mini/packages/shared/src/index.ts
     */
    /**
     * 判断是否为一个数组
     */
    var isArray = Array.isArray;
    /**
     * 判断是否为一个对象
     */
    var isObject = function (val) {
        return val !== null && typeof val === 'object';
    };
    /**
     * 对比两个数据是否发生了改变
     */
    var hasChanged = function (value, oldValue) {
        return !Object.is(value, oldValue);
    };

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    /**
     * 依据 effects 生成 dep 实例
     */
    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    /**
     * 单例的，当前的 effect
     */
    var activeEffect;
    /**
     * 收集所有依赖的 WeakMap 实例：
     * 1. `key`：响应性对象
     * 2. `value`：`Map` 对象
     * 		1. `key`：响应性对象的指定属性
     * 		2. `value`：指定对象的指定属性的 执行函数
     */
    var targetMap = new WeakMap();
    /**
     * 响应性触发依赖时的执行类
     */
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn) {
            this.fn = fn;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        ReactiveEffect.prototype.stop = function () { };
        return ReactiveEffect;
    }());
    /**
     * 用于收集依赖的方法
     * @param target WeakMap 的 key
     * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
     */
    function track(target, key) {
        // 如果当前不存在执行函数，则直接 return
        if (!activeEffect)
            return;
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    /**
     * 利用 dep 依次跟踪指定 key 的所有 effect
     * @param dep
     */
    function trackEffects(dep) {
        // activeEffect! ： 断言 activeEffect 不为 null
        dep.add(activeEffect);
    }
    /**
     * 触发依赖的方法
     * @param target WeakMap 的 key
     * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
     */
    function trigger(target, key) {
        // 依据 target 获取存储的 map 实例
        var depsMap = targetMap.get(target);
        // 如果 map 不存在，则直接 return
        if (!depsMap)
            return;
        // 依据指定的 key，获取 dep 实例
        var dep = depsMap.get(key);
        // dep 不存在则直接 return
        if (!dep)
            return;
        // 触发 dep
        triggerEffects(dep);
    }
    function triggerEffects(dep) {
        var e_1, _a;
        var effects = isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect_1 = effects_1_1.value;
                triggerEffect(effect_1);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    /**
     * 触发指定的依赖
     */
    function triggerEffect(effect) {
        effect.run();
    }
    /**
     * effect 函数
     * @param fn 执行方法
     * @returns 以 ReactiveEffect 实例为 this 的执行函数
     */
    function effect(fn) {
        var _effect = new ReactiveEffect(fn);
        _effect.run();
    }

    /*
     * @Author: Marshall
     * @Date: 2023-09-24 21:40:58
     * @LastEditors: Marshall
     * @LastEditTime: 2023-09-24 21:59:05
     * @Description:
     * @FilePath: /vue3-mini/packages/reactivity/src/baseHandlers.ts
     */
    /**
     * getter 回调方法
     */
    var get = createGetter();
    /**
     * 创建 getter 回调方法
     */
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            // 收集依赖
            track(target, key);
            return res;
        };
    }
    /**
     * setter 回调方法
     */
    var set = createSetter();
    /**
     * 创建 setter 回调方法
     */
    function createSetter() {
        return function set(target, key, value, receiver) {
            // 利用 Reflect.set 设置新值
            var result = Reflect.set(target, key, value, receiver);
            // 触发依赖
            trigger(target, key);
            return result;
        };
    }
    /**
     * 响应性的 handler
     */
    var mutableHandlers = {
        get: get,
        set: set
    };

    /*
     * @Author: Marshall
     * @Date: 2023-09-24 15:20:30
     * @LastEditors: Marshall
     * @LastEditTime: 2023-10-09 21:21:47
     * @Description:
     * @FilePath: /vue3-mini/packages/reactivity/src/reactive.ts
     */
    /**
     * 响应式 Map 缓存对象
     * key: target
     * val: proxy
     */
    var reactiveMap = new WeakMap();
    /**
     * 为复杂数据类型，创建响应式对象
     * @param target 被代理对象
     * @returns 代理对象
     */
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandler, proxyMap) {
        // 如果该实例已经被代理，则直接读取即可
        var existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        // 未被代理则生成 proxy 实例
        var proxy = new Proxy(target, baseHandler);
        // 为 Reactive 增加标记
        proxy["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */] = true;
        // 缓存代理对象
        proxyMap.set(target, proxy);
        return proxy;
    }
    /**
     * 将指定数据变为 reactive 数据
     */
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };

    /*
     * @Author: Marshall
     * @Date: 2023-10-06 08:20:54
     * @LastEditors: Marshall
     * @LastEditTime: 2023-10-12 07:30:13
     * @Description:
     * @FilePath: /vue3-mini/packages/reactivity/src/ref.ts
     */
    /**
     * ref 函数
     * @param value unknown
     */
    function ref(value) {
        return createRef(value, false);
    }
    /**
     * ref 函数
     * @param value unknown
     */
    function createRef(rawValue, shadow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shadow);
    }
    /**
     * 创建 RefImpl 实例
     * @param rawValue 原始数据
     * @param shallow boolean 形数据，表示《浅层的响应性（即：只有 .value 是响应性的）》
     * @returns
     */
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShadow) {
            this.__v_isShadow = __v_isShadow;
            this.dep = undefined;
            // 是否为 ref 类型数据的标记
            this.__v_isRef = true;
            // 如果 __v_isShallow 为 true，则 value 不会被转化为 reactive 数据，即如果当前 value 为复杂数据类型，则会失去响应性。对应官方文档 shallowRef ：https://cn.vuejs.org/api/reactivity-advanced.html#shallowref
            this._value = __v_isShadow ? value : toReactive(value);
            this._rawValue = value;
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            /**
               * get 语法将对象属性绑定到查询该属性时将被调用的函数。
               * 即：xxx.value 时触发该函数
               */
            get: function () {
                // 收集依赖
                trackRefValue(this);
                return this._value;
            },
            set: function (newVal) {
                /**
                     * newVal 为新数据
                     * this._rawValue 为旧数据（原始数据）
                     * 对比两个数据是否发生了变化
                     */
                if (hasChanged(newVal, this._rawValue)) {
                    // 更新原始数据
                    this._rawValue = newVal;
                    // 更新 .value 的值
                    this._value = toReactive(newVal);
                    // 触发依赖
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    /**
     * 为 ref 的 value 进行依赖收集工作
     */
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    /**
     * 为 ref 的 value 进行触发依赖工作
     */
    function triggerRefValue(ref) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }
    /**
     * 指定数据是否为 RefImpl 类型
     */
    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }

    exports.effect = effect;
    exports.reactive = reactive;
    exports.ref = ref;

    return exports;

})({});
//# sourceMappingURL=vue.js.map
