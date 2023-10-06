/*
 * @Author: Marshall
 * @Date: 2023-09-24 15:20:30
 * @LastEditors: Marshall
 * @LastEditTime: 2023-09-24 21:53:52
 * @Description:
 * @FilePath: /vue3-mini/packages/reactivity/src/reactive.ts
 */

import { mutableHandlers } from "./baseHandlers"

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

/**
 * 响应式 Map 缓存对象
 * key: target
 * val: proxy
 */
export const reactiveMap = new WeakMap<object, any>()

/**
 * 为复杂数据类型，创建响应式对象
 * @param target 被代理对象
 * @returns 代理对象
 */
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

function createReactiveObject(
  target: object,
  baseHandler: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) {
  // 如果该实例已经被代理，则直接读取即可
  const existingProxy = proxyMap.get(target)
  if(existingProxy) {
    return existingProxy
  }

  // 未被代理则生成 proxy 实例
  const proxy = new Proxy(target, baseHandler)
  // 为 Reactive 增加标记
  proxy[ReactiveFlags.IS_REACTIVE] = true

  // 缓存代理对象
  proxyMap.set(target, proxy)
  return proxy
}