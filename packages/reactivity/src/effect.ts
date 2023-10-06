/*
 * @Author: Marshall
 * @Date: 2023-09-24 21:40:36
 * @LastEditors: Marshall
 * @LastEditTime: 2023-09-24 23:24:11
 * @Description:
 * @FilePath: /vue3-mini/packages/reactivity/src/effect.ts
 */
import { isArray } from "@vue/shared"
import { Dep, createDep } from "./dep"

type KeyToDepMap = Map<any, Dep>

/**
 * 单例的，当前的 effect
 */
export let activeEffect: ReactiveEffect | undefined

/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 * 		1. `key`：响应性对象的指定属性
 * 		2. `value`：指定对象的指定属性的 执行函数
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T= any> {
  constructor(public fn:() => T) {}

  run() {
    activeEffect = this

    return this.fn()
  }

  stop() {}
}

/**
 * 用于收集依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 */
export function track(target: object, key: unknown) {
  // 如果当前不存在执行函数，则直接 return
  if(!activeEffect) return
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  trackEffects(dep)
}

/**
 * 利用 dep 依次跟踪指定 key 的所有 effect
 * @param dep
 */
export function trackEffects(dep: Dep) {
  // activeEffect! ： 断言 activeEffect 不为 null
  dep.add(activeEffect!)
}

/**
 * 触发依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 */
export function trigger(target: object, key?: unknown) {
  // 依据 target 获取存储的 map 实例
  const depsMap = targetMap.get(target)
  // 如果 map 不存在，则直接 return
  if(!depsMap) return

  // 依据指定的 key，获取 dep 实例
  let dep: Dep | undefined = depsMap.get(key)
  // dep 不存在则直接 return
  if(!dep) return

  // 触发 dep
  triggerEffects(dep)
}

export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep]

  for(const effect of effects) {
    triggerEffect(effect)
  }
}

/**
 * 触发指定的依赖
 */
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}

/**
 * effect 函数
 * @param fn 执行方法
 * @returns 以 ReactiveEffect 实例为 this 的执行函数
 */
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}