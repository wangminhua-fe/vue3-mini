/*
 * @Author: Marshall
 * @Date: 2023-09-24 21:40:44
 * @LastEditors: Marshall
 * @LastEditTime: 2023-09-24 23:06:05
 * @Description:
 * @FilePath: /vue3-mini/packages/reactivity/src/dep.ts
 */
import { ReactiveEffect } from "./effect";

export type Dep = Set<ReactiveEffect>

/**
 * 依据 effects 生成 dep 实例
 */
export const createDep = (effects?: ReactiveEffect[]): Dep => {
  const dep = new Set<ReactiveEffect>(effects) as Dep
  return dep
}