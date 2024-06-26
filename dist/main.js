const Interval = class w {
  /**
   * Accept two comparable values and creates new instance of interval
   * Predicate Interval.comparable_less(low, high) supposed to return true on these values
   * @param low
   * @param high
   */
  constructor(e, t) {
    this.low = e, this.high = t;
  }
  /**
   * Clone interval
   * @returns {Interval}
   */
  clone() {
    return new w(this.low, this.high);
  }
  /**
   * Propery max returns clone of this interval
   * @returns {Interval}
   */
  get max() {
    return this.clone();
  }
  /**
   * Predicate returns true is this interval less than other interval
   * @param other_interval
   * @returns {boolean}
   */
  less_than(e) {
    return this.low < e.low || this.low == e.low && this.high < e.high;
  }
  /**
   * Predicate returns true is this interval equals to other interval
   * @param other_interval
   * @returns {boolean}
   */
  equal_to(e) {
    return this.low == e.low && this.high == e.high;
  }
  /**
   * Predicate returns true if this interval intersects other interval
   * @param other_interval
   * @returns {boolean}
   */
  intersect(e) {
    return !this.not_intersect(e);
  }
  /**
   * Predicate returns true if this interval does not intersect other interval
   * @param other_interval
   * @returns {boolean}
   */
  not_intersect(e) {
    return this.high < e.low || e.high < this.low;
  }
  /**
   * Returns new interval merged with other interval
   * @param {Interval} interval - Other interval to merge with
   * @returns {Interval}
   */
  merge(e) {
    return new w(
      this.low === void 0 ? e.low : Math.min(this.low, e.low),
      this.high === void 0 ? e.high : Math.max(this.high, e.high)
    );
  }
  /**
   * Returns how key should return
   */
  output() {
    return [this.low, this.high];
  }
  /**
   * Function returns maximum between two comparable values
   * @param interval1
   * @param interval2
   * @returns {Interval}
   */
  static comparable_max(e, t) {
    return e.merge(t);
  }
  /**
   * Predicate returns true if first value less than second value
   * @param val1
   * @param val2
   * @returns {boolean}
   */
  static comparable_less_than(e, t) {
    return e < t;
  }
}, RB_TREE_COLOR_RED = 0, RB_TREE_COLOR_BLACK = 1;
class Node {
  constructor(e = void 0, t = void 0, n = null, r = null, o = null, s = RB_TREE_COLOR_BLACK) {
    this.left = n, this.right = r, this.parent = o, this.color = s, this.item = { key: e, value: t }, e && e instanceof Array && e.length == 2 && !Number.isNaN(e[0]) && !Number.isNaN(e[1]) && (this.item.key = new Interval(Math.min(e[0], e[1]), Math.max(e[0], e[1]))), this.max = this.item.key ? this.item.key.max : void 0;
  }
  isNil() {
    return this.item.key === void 0 && this.item.value === void 0 && this.left === null && this.right === null && this.color === RB_TREE_COLOR_BLACK;
  }
  _value_less_than(e) {
    return this.item.value && e.item.value && this.item.value.less_than ? this.item.value.less_than(e.item.value) : this.item.value < e.item.value;
  }
  less_than(e) {
    return this.item.value === this.item.key && e.item.value === e.item.key ? this.item.key.less_than(e.item.key) : this.item.key.less_than(e.item.key) || this.item.key.equal_to(e.item.key) && this._value_less_than(e);
  }
  _value_equal(e) {
    return this.item.value && e.item.value && this.item.value.equal_to ? this.item.value.equal_to(e.item.value) : this.item.value == e.item.value;
  }
  equal_to(e) {
    return this.item.value === this.item.key && e.item.value === e.item.key ? this.item.key.equal_to(e.item.key) : this.item.key.equal_to(e.item.key) && this._value_equal(e);
  }
  intersect(e) {
    return this.item.key.intersect(e.item.key);
  }
  copy_data(e) {
    this.item.key = e.item.key, this.item.value = e.item.value;
  }
  update_max() {
    if (this.max = this.item.key ? this.item.key.max : void 0, this.right && this.right.max) {
      const e = this.item.key.constructor.comparable_max;
      this.max = e(this.max, this.right.max);
    }
    if (this.left && this.left.max) {
      const e = this.item.key.constructor.comparable_max;
      this.max = e(this.max, this.left.max);
    }
  }
  // Other_node does not intersect any node of left subtree, if this.left.max < other_node.item.key.low
  not_intersect_left_subtree(e) {
    const t = this.item.key.constructor.comparable_less_than;
    let n = this.left.max.high !== void 0 ? this.left.max.high : this.left.max;
    return t(n, e.item.key.low);
  }
  // Other_node does not intersect right subtree if other_node.item.key.high < this.right.key.low
  not_intersect_right_subtree(e) {
    const t = this.item.key.constructor.comparable_less_than;
    let n = this.right.max.low !== void 0 ? this.right.max.low : this.right.item.key.low;
    return t(e.item.key.high, n);
  }
}
class IntervalTree {
  /**
   * Construct new empty instance of IntervalTree
   */
  constructor() {
    this.root = null, this.nil_node = new Node();
  }
  /**
   * Returns number of items stored in the interval tree
   * @returns {number}
   */
  get size() {
    let e = 0;
    return this.tree_walk(this.root, () => e++), e;
  }
  /**
   * Returns array of sorted keys in the ascending order
   * @returns {Array}
   */
  get keys() {
    let e = [];
    return this.tree_walk(this.root, (t) => e.push(
      t.item.key.output ? t.item.key.output() : t.item.key
    )), e;
  }
  /**
   * Return array of values in the ascending keys order
   * @returns {Array}
   */
  get values() {
    let e = [];
    return this.tree_walk(this.root, (t) => e.push(t.item.value)), e;
  }
  /**
   * Returns array of items (<key,value> pairs) in the ascended keys order
   * @returns {Array}
   */
  get items() {
    let e = [];
    return this.tree_walk(this.root, (t) => e.push({
      key: t.item.key.output ? t.item.key.output() : t.item.key,
      value: t.item.value
    })), e;
  }
  /**
   * Returns true if tree is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.root == null || this.root == this.nil_node;
  }
  /**
   * Clear tree
   */
  clear() {
    this.root = null;
  }
  /**
   * Insert new item into interval tree
   * @param {Interval} key - interval object or array of two numbers [low, high]
   * @param {any} value - value representing any object (optional)
   * @returns {Node} returns reference to inserted node as an object {key:interval, value: value}
   */
  insert(e, t = e) {
    if (e === void 0)
      return;
    let n = new Node(e, t, this.nil_node, this.nil_node, null, RB_TREE_COLOR_RED);
    return this.tree_insert(n), this.recalc_max(n), n;
  }
  /**
   * Returns true if item {key,value} exist in the tree
   * @param {Interval} key - interval correspondent to keys stored in the tree
   * @param {any} value - value object to be checked
   * @returns {boolean} true if item {key, value} exist in the tree, false otherwise
   */
  exist(e, t = e) {
    let n = new Node(e, t);
    return !!this.tree_search(this.root, n);
  }
  /**
   * Remove entry {key, value} from the tree
   * @param {Interval} key - interval correspondent to keys stored in the tree
   * @param {any} value - value object
   * @returns {boolean} true if item {key, value} deleted, false if not found
   */
  remove(e, t = e) {
    let n = new Node(e, t), r = this.tree_search(this.root, n);
    return r && this.tree_delete(r), r;
  }
  /**
   * Returns array of entry values which keys intersect with given interval <br/>
   * If no values stored in the tree, returns array of keys which intersect given interval
   * @param {Interval} interval - search interval, or tuple [low, high]
   * @param outputMapperFn(value,key) - optional function that maps (value, key) to custom output
   * @returns {Array}
   */
  search(e, t = (n, r) => n === r ? r.output() : n) {
    let n = new Node(e), r = [];
    return this.tree_search_interval(this.root, n, r), r.map((o) => t(o.item.value, o.item.key));
  }
  /**
   * Returns true if intersection between given and any interval stored in the tree found
   * @param {Interval} interval - search interval or tuple [low, high]
   * @returns {boolean}
   */
  intersect_any(e) {
    let t = new Node(e);
    return this.tree_find_any_interval(this.root, t);
  }
  /**
   * Tree visitor. For each node implement a callback function. <br/>
   * Method calls a callback function with two parameters (key, value)
   * @param visitor(key,value) - function to be called for each tree item
   */
  forEach(e) {
    this.tree_walk(this.root, (t) => e(t.item.key, t.item.value));
  }
  /**
   * Value Mapper. Walk through every node and map node value to another value
   * @param callback(value,key) - function to be called for each tree item
   */
  map(e) {
    const t = new IntervalTree();
    return this.tree_walk(this.root, (n) => t.insert(n.item.key, e(n.item.value, n.item.key))), t;
  }
  /**
   * @param {Interval} interval - optional if the iterator is intended to start from the beginning
   * @param outputMapperFn(value,key) - optional function that maps (value, key) to custom output
   * @returns {Iterator}
   */
  *iterate(e, t = (n, r) => n === r ? r.output() : n) {
    let n;
    for (e ? n = this.tree_search_nearest_forward(this.root, new Node(e)) : this.root && (n = this.local_minimum(this.root)); n; )
      yield t(n.item.value, n.item.key), n = this.tree_successor(n);
  }
  recalc_max(e) {
    let t = e;
    for (; t.parent != null; )
      t.parent.update_max(), t = t.parent;
  }
  tree_insert(e) {
    let t = this.root, n = null;
    if (this.root == null || this.root == this.nil_node)
      this.root = e;
    else {
      for (; t != this.nil_node; )
        n = t, e.less_than(t) ? t = t.left : t = t.right;
      e.parent = n, e.less_than(n) ? n.left = e : n.right = e;
    }
    this.insert_fixup(e);
  }
  // After insertion insert_node may have red-colored parent, and this is a single possible violation
  // Go upwords to the root and re-color until violation will be resolved
  insert_fixup(e) {
    let t, n;
    for (t = e; t != this.root && t.parent.color == RB_TREE_COLOR_RED; )
      t.parent == t.parent.parent.left ? (n = t.parent.parent.right, n.color == RB_TREE_COLOR_RED ? (t.parent.color = RB_TREE_COLOR_BLACK, n.color = RB_TREE_COLOR_BLACK, t.parent.parent.color = RB_TREE_COLOR_RED, t = t.parent.parent) : (t == t.parent.right && (t = t.parent, this.rotate_left(t)), t.parent.color = RB_TREE_COLOR_BLACK, t.parent.parent.color = RB_TREE_COLOR_RED, this.rotate_right(t.parent.parent))) : (n = t.parent.parent.left, n.color == RB_TREE_COLOR_RED ? (t.parent.color = RB_TREE_COLOR_BLACK, n.color = RB_TREE_COLOR_BLACK, t.parent.parent.color = RB_TREE_COLOR_RED, t = t.parent.parent) : (t == t.parent.left && (t = t.parent, this.rotate_right(t)), t.parent.color = RB_TREE_COLOR_BLACK, t.parent.parent.color = RB_TREE_COLOR_RED, this.rotate_left(t.parent.parent)));
    this.root.color = RB_TREE_COLOR_BLACK;
  }
  tree_delete(e) {
    let t, n;
    e.left == this.nil_node || e.right == this.nil_node ? t = e : t = this.tree_successor(e), t.left != this.nil_node ? n = t.left : n = t.right, n.parent = t.parent, t == this.root ? this.root = n : (t == t.parent.left ? t.parent.left = n : t.parent.right = n, t.parent.update_max()), this.recalc_max(n), t != e && (e.copy_data(t), e.update_max(), this.recalc_max(e)), /*fix_node != this.nil_node && */
    t.color == RB_TREE_COLOR_BLACK && this.delete_fixup(n);
  }
  delete_fixup(e) {
    let t = e, n;
    for (; t != this.root && t.parent != null && t.color == RB_TREE_COLOR_BLACK; )
      t == t.parent.left ? (n = t.parent.right, n.color == RB_TREE_COLOR_RED && (n.color = RB_TREE_COLOR_BLACK, t.parent.color = RB_TREE_COLOR_RED, this.rotate_left(t.parent), n = t.parent.right), n.left.color == RB_TREE_COLOR_BLACK && n.right.color == RB_TREE_COLOR_BLACK ? (n.color = RB_TREE_COLOR_RED, t = t.parent) : (n.right.color == RB_TREE_COLOR_BLACK && (n.color = RB_TREE_COLOR_RED, n.left.color = RB_TREE_COLOR_BLACK, this.rotate_right(n), n = t.parent.right), n.color = t.parent.color, t.parent.color = RB_TREE_COLOR_BLACK, n.right.color = RB_TREE_COLOR_BLACK, this.rotate_left(t.parent), t = this.root)) : (n = t.parent.left, n.color == RB_TREE_COLOR_RED && (n.color = RB_TREE_COLOR_BLACK, t.parent.color = RB_TREE_COLOR_RED, this.rotate_right(t.parent), n = t.parent.left), n.left.color == RB_TREE_COLOR_BLACK && n.right.color == RB_TREE_COLOR_BLACK ? (n.color = RB_TREE_COLOR_RED, t = t.parent) : (n.left.color == RB_TREE_COLOR_BLACK && (n.color = RB_TREE_COLOR_RED, n.right.color = RB_TREE_COLOR_BLACK, this.rotate_left(n), n = t.parent.left), n.color = t.parent.color, t.parent.color = RB_TREE_COLOR_BLACK, n.left.color = RB_TREE_COLOR_BLACK, this.rotate_right(t.parent), t = this.root));
    t.color = RB_TREE_COLOR_BLACK;
  }
  tree_search(e, t) {
    if (!(e == null || e == this.nil_node))
      return t.equal_to(e) ? e : t.less_than(e) ? this.tree_search(e.left, t) : this.tree_search(e.right, t);
  }
  tree_search_nearest_forward(e, t) {
    let n, r = e;
    for (; r && r != this.nil_node; )
      r.less_than(t) ? r.intersect(t) ? (n = r, r = r.left) : r = r.right : ((!n || r.less_than(n)) && (n = r), r = r.left);
    return n || null;
  }
  // Original search_interval method; container res support push() insertion
  // Search all intervals intersecting given one
  tree_search_interval(e, t, n) {
    e != null && e != this.nil_node && (e.left != this.nil_node && !e.not_intersect_left_subtree(t) && this.tree_search_interval(e.left, t, n), e.intersect(t) && n.push(e), e.right != this.nil_node && !e.not_intersect_right_subtree(t) && this.tree_search_interval(e.right, t, n));
  }
  tree_find_any_interval(e, t) {
    let n = !1;
    return e != null && e != this.nil_node && (e.left != this.nil_node && !e.not_intersect_left_subtree(t) && (n = this.tree_find_any_interval(e.left, t)), n || (n = e.intersect(t)), !n && e.right != this.nil_node && !e.not_intersect_right_subtree(t) && (n = this.tree_find_any_interval(e.right, t))), n;
  }
  local_minimum(e) {
    let t = e;
    for (; t.left != null && t.left != this.nil_node; )
      t = t.left;
    return t;
  }
  // not in use
  local_maximum(e) {
    let t = e;
    for (; t.right != null && t.right != this.nil_node; )
      t = t.right;
    return t;
  }
  tree_successor(e) {
    let t, n, r;
    if (e.right != this.nil_node)
      t = this.local_minimum(e.right);
    else {
      for (n = e, r = e.parent; r != null && r.right == n; )
        n = r, r = r.parent;
      t = r;
    }
    return t;
  }
  //           |            right-rotate(T,y)       |
  //           y            ---------------.       x
  //          / \                                  / \
  //         x   c          left-rotate(T,x)      a   y
  //        / \             <---------------         / \
  //       a   b                                    b   c
  rotate_left(e) {
    let t = e.right;
    e.right = t.left, t.left != this.nil_node && (t.left.parent = e), t.parent = e.parent, e == this.root ? this.root = t : e == e.parent.left ? e.parent.left = t : e.parent.right = t, t.left = e, e.parent = t, e != null && e != this.nil_node && e.update_max(), t = e.parent, t != null && t != this.nil_node && t.update_max();
  }
  rotate_right(e) {
    let t = e.left;
    e.left = t.right, t.right != this.nil_node && (t.right.parent = e), t.parent = e.parent, e == this.root ? this.root = t : e == e.parent.left ? e.parent.left = t : e.parent.right = t, t.right = e, e.parent = t, e != null && e != this.nil_node && e.update_max(), t = e.parent, t != null && t != this.nil_node && t.update_max();
  }
  tree_walk(e, t) {
    e != null && e != this.nil_node && (this.tree_walk(e.left, t), t(e), this.tree_walk(e.right, t));
  }
  /* Return true if all red nodes have exactly two black child nodes */
  testRedBlackProperty() {
    let e = !0;
    return this.tree_walk(this.root, function(t) {
      t.color == RB_TREE_COLOR_RED && (t.left.color == RB_TREE_COLOR_BLACK && t.right.color == RB_TREE_COLOR_BLACK || (e = !1));
    }), e;
  }
  /* Throw error if not every path from root to bottom has same black height */
  testBlackHeightProperty(e) {
    let t = 0, n = 0, r = 0;
    if (e.color == RB_TREE_COLOR_BLACK && t++, e.left != this.nil_node ? n = this.testBlackHeightProperty(e.left) : n = 1, e.right != this.nil_node ? r = this.testBlackHeightProperty(e.right) : r = 1, n != r)
      throw new Error("Red-black height property violated");
    return t += n, t;
  }
}
class Timeline {
  constructor(e, t, n) {
    this.getStartTime = t, this.getEndTime = n, this.tree = new IntervalTree();
    for (const r of e)
      this.tree.insert([this.getStartTime(r), this.getEndTime(r)], r);
  }
  get(e) {
    return this.tree.search([e, e]);
  }
}
class EventsTimeline extends Timeline {
  constructor(e) {
    super(e.events, (t) => t.processingStart, (t) => t.processingEnd);
  }
}
class InteractionsTimeline extends Timeline {
  constructor(e) {
    super(e.events.filter((t) => t.interactionId !== void 0).filter((t, n, r) => n === r.findIndex((o) => o.interactionId === t.interactionId)), (t) => t.startTime, (t) => t.startTime + t.duration);
  }
}
class LongTasksTimeline extends Timeline {
  constructor(e) {
    super(e.longTasks, (t) => t.startTime, (t) => t.startTime + t.duration);
  }
}
class MeasuresTimeline extends Timeline {
  constructor(e) {
    super(e.measures, (t) => t.startTime, (t) => t.startTime + t.duration);
  }
}
class NavigationTimeline extends Timeline {
  constructor(e) {
    super(e.navigation, (t) => t.startTime, (t) => t.endTime);
  }
}
class LruCache {
  constructor(e) {
    this.values = /* @__PURE__ */ new Map(), this.maxEntries = e;
  }
  get(e) {
    let t;
    return this.values.has(e) && (t = this.values.get(e), this.values.delete(e), this.values.set(e, t)), t;
  }
  set(e, t) {
    if (this.values.size >= this.maxEntries) {
      const n = this.values.keys().next().value;
      this.values.delete(n);
    }
    this.values.set(e, t);
  }
}
const registry = new LruCache(2400);
function getLongTaskId(i) {
  const e = registry.get(i) || generateUUID();
  return registry.set(i, e), e;
}
function generateUUID(i) {
  return i ? (parseInt(i, 10) ^ Math.random() * 16 >> parseInt(i, 10) / 4).toString(16) : `10000000-1000-4000-8000-${1e11}`.replace(/[018]/g, generateUUID);
}
function getRum() {
  return window.DD_RUM;
}
class SamplesView {
  constructor(e) {
    this.trace = e;
  }
  /**
   * Get sample start time.
   * /!\ It assumes a sample exists at given index.
   *
   * @param index Index of sample in samples array
   * @returns Sample start time
   */
  getStartTime(e) {
    return e === 0 ? this.trace.samples[e].timestamp - this.trace.sampleInterval / 2 : (this.trace.samples[e - 1].timestamp + this.trace.samples[e].timestamp) / 2;
  }
  /**
   * Get sample middle time.
   * /!\ It assumes a sample exists at given index.
   *
   * @param index Index of sample in samples array
   * @returns Sample middle time
   */
  getMiddleTime(e) {
    return this.trace.samples[e].timestamp;
  }
  /**
   * Get sample end time.
   * /!\ It assumes a sample exists at given index.
   *
   * @param index Index of sample in samples array
   * @returns Sample end time
   */
  getEndTime(e) {
    return e === this.trace.samples.length - 1 ? this.trace.samples[e].timestamp + this.trace.sampleInterval / 2 : (this.trace.samples[e].timestamp + this.trace.samples[e + 1].timestamp) / 2;
  }
}
class StringsTable {
  /**
   * @param strings Strings to initialize - assumes that it's an array of unique strings
   */
  constructor() {
    this.stringsMap = /* @__PURE__ */ new Map([["", 0]]);
  }
  /**
   * Adds new string to strings table and returns its index
   */
  dedup(e) {
    if (this.stringsMap.has(e))
      return this.stringsMap.get(e);
    {
      const t = this.stringsMap.size;
      return this.stringsMap.set(e, t), t;
    }
  }
  [Symbol.iterator]() {
    return this.stringsMap.keys();
  }
}
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues && (getRandomValues = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !getRandomValues))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return getRandomValues(rnds8);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i)
  byteToHex.push((i + 256).toString(16).slice(1));
function unsafeStringify(i, e = 0) {
  return byteToHex[i[e + 0]] + byteToHex[i[e + 1]] + byteToHex[i[e + 2]] + byteToHex[i[e + 3]] + "-" + byteToHex[i[e + 4]] + byteToHex[i[e + 5]] + "-" + byteToHex[i[e + 6]] + byteToHex[i[e + 7]] + "-" + byteToHex[i[e + 8]] + byteToHex[i[e + 9]] + "-" + byteToHex[i[e + 10]] + byteToHex[i[e + 11]] + byteToHex[i[e + 12]] + byteToHex[i[e + 13]] + byteToHex[i[e + 14]] + byteToHex[i[e + 15]];
}
const randomUUID = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), native = {
  randomUUID
};
function v4(i, e, t) {
  if (native.randomUUID && !e && !i)
    return native.randomUUID();
  i = i || {};
  const n = i.random || (i.rng || rng)();
  if (n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, e) {
    t = t || 0;
    for (let r = 0; r < 16; ++r)
      e[t + r] = n[r];
    return e;
  }
  return unsafeStringify(n);
}
function buildEndpoint(i, e, t, n, r) {
  const o = `/api/v2/${t}`, s = buildEndpointHost(i), u = buildEndpointParameters(e, n, r);
  return `https://${s}${o}?${u}`;
}
function buildEndpointHost(i) {
  const e = i.split("."), t = e.pop();
  return `browser-intake-${e.join("-")}.${t}`;
}
function buildEndpointParameters(i, e, t) {
  const n = [`api:${t}`].concat(e);
  return [
    "ddsource=browser",
    `ddtags=${encodeURIComponent(n.join(","))}`,
    `dd-api-key=${i}`,
    "dd-evp-origin=browser",
    `dd-request-id=${v4()}`
  ].join("&");
}
var commonjsGlobal = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, indexMinimal = {}, minimal$1 = {}, aspromise = asPromise;
function asPromise(i, e) {
  for (var t = new Array(arguments.length - 1), n = 0, r = 2, o = !0; r < arguments.length; )
    t[n++] = arguments[r++];
  return new Promise(function(u, l) {
    t[n] = function(f) {
      if (o)
        if (o = !1, f)
          l(f);
        else {
          for (var h = new Array(arguments.length - 1), d = 0; d < h.length; )
            h[d++] = arguments[d];
          u.apply(null, h);
        }
    };
    try {
      i.apply(e || null, t);
    } catch (a) {
      o && (o = !1, l(a));
    }
  });
}
var base64$1 = {};
(function(i) {
  var e = i;
  e.length = function(u) {
    var l = u.length;
    if (!l)
      return 0;
    for (var a = 0; --l % 4 > 1 && u.charAt(l) === "="; )
      ++a;
    return Math.ceil(u.length * 3) / 4 - a;
  };
  for (var t = new Array(64), n = new Array(123), r = 0; r < 64; )
    n[t[r] = r < 26 ? r + 65 : r < 52 ? r + 71 : r < 62 ? r - 4 : r - 59 | 43] = r++;
  e.encode = function(u, l, a) {
    for (var f = null, h = [], d = 0, _ = 0, p; l < a; ) {
      var c = u[l++];
      switch (_) {
        case 0:
          h[d++] = t[c >> 2], p = (c & 3) << 4, _ = 1;
          break;
        case 1:
          h[d++] = t[p | c >> 4], p = (c & 15) << 2, _ = 2;
          break;
        case 2:
          h[d++] = t[p | c >> 6], h[d++] = t[c & 63], _ = 0;
          break;
      }
      d > 8191 && ((f || (f = [])).push(String.fromCharCode.apply(String, h)), d = 0);
    }
    return _ && (h[d++] = t[p], h[d++] = 61, _ === 1 && (h[d++] = 61)), f ? (d && f.push(String.fromCharCode.apply(String, h.slice(0, d))), f.join("")) : String.fromCharCode.apply(String, h.slice(0, d));
  };
  var o = "invalid encoding";
  e.decode = function(u, l, a) {
    for (var f = a, h = 0, d, _ = 0; _ < u.length; ) {
      var p = u.charCodeAt(_++);
      if (p === 61 && h > 1)
        break;
      if ((p = n[p]) === void 0)
        throw Error(o);
      switch (h) {
        case 0:
          d = p, h = 1;
          break;
        case 1:
          l[a++] = d << 2 | (p & 48) >> 4, d = p, h = 2;
          break;
        case 2:
          l[a++] = (d & 15) << 4 | (p & 60) >> 2, d = p, h = 3;
          break;
        case 3:
          l[a++] = (d & 3) << 6 | p, h = 0;
          break;
      }
    }
    if (h === 1)
      throw Error(o);
    return a - f;
  }, e.test = function(u) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(u);
  };
})(base64$1);
var eventemitter = EventEmitter;
function EventEmitter() {
  this._listeners = {};
}
EventEmitter.prototype.on = function(e, t, n) {
  return (this._listeners[e] || (this._listeners[e] = [])).push({
    fn: t,
    ctx: n || this
  }), this;
};
EventEmitter.prototype.off = function(e, t) {
  if (e === void 0)
    this._listeners = {};
  else if (t === void 0)
    this._listeners[e] = [];
  else
    for (var n = this._listeners[e], r = 0; r < n.length; )
      n[r].fn === t ? n.splice(r, 1) : ++r;
  return this;
};
EventEmitter.prototype.emit = function(e) {
  var t = this._listeners[e];
  if (t) {
    for (var n = [], r = 1; r < arguments.length; )
      n.push(arguments[r++]);
    for (r = 0; r < t.length; )
      t[r].fn.apply(t[r++].ctx, n);
  }
  return this;
};
var float = factory(factory);
function factory(i) {
  return typeof Float32Array < "u" ? function() {
    var e = new Float32Array([-0]), t = new Uint8Array(e.buffer), n = t[3] === 128;
    function r(l, a, f) {
      e[0] = l, a[f] = t[0], a[f + 1] = t[1], a[f + 2] = t[2], a[f + 3] = t[3];
    }
    function o(l, a, f) {
      e[0] = l, a[f] = t[3], a[f + 1] = t[2], a[f + 2] = t[1], a[f + 3] = t[0];
    }
    i.writeFloatLE = n ? r : o, i.writeFloatBE = n ? o : r;
    function s(l, a) {
      return t[0] = l[a], t[1] = l[a + 1], t[2] = l[a + 2], t[3] = l[a + 3], e[0];
    }
    function u(l, a) {
      return t[3] = l[a], t[2] = l[a + 1], t[1] = l[a + 2], t[0] = l[a + 3], e[0];
    }
    i.readFloatLE = n ? s : u, i.readFloatBE = n ? u : s;
  }() : function() {
    function e(n, r, o, s) {
      var u = r < 0 ? 1 : 0;
      if (u && (r = -r), r === 0)
        n(1 / r > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), o, s);
      else if (isNaN(r))
        n(2143289344, o, s);
      else if (r > 34028234663852886e22)
        n((u << 31 | 2139095040) >>> 0, o, s);
      else if (r < 11754943508222875e-54)
        n((u << 31 | Math.round(r / 1401298464324817e-60)) >>> 0, o, s);
      else {
        var l = Math.floor(Math.log(r) / Math.LN2), a = Math.round(r * Math.pow(2, -l) * 8388608) & 8388607;
        n((u << 31 | l + 127 << 23 | a) >>> 0, o, s);
      }
    }
    i.writeFloatLE = e.bind(null, writeUintLE), i.writeFloatBE = e.bind(null, writeUintBE);
    function t(n, r, o) {
      var s = n(r, o), u = (s >> 31) * 2 + 1, l = s >>> 23 & 255, a = s & 8388607;
      return l === 255 ? a ? NaN : u * (1 / 0) : l === 0 ? u * 1401298464324817e-60 * a : u * Math.pow(2, l - 150) * (a + 8388608);
    }
    i.readFloatLE = t.bind(null, readUintLE), i.readFloatBE = t.bind(null, readUintBE);
  }(), typeof Float64Array < "u" ? function() {
    var e = new Float64Array([-0]), t = new Uint8Array(e.buffer), n = t[7] === 128;
    function r(l, a, f) {
      e[0] = l, a[f] = t[0], a[f + 1] = t[1], a[f + 2] = t[2], a[f + 3] = t[3], a[f + 4] = t[4], a[f + 5] = t[5], a[f + 6] = t[6], a[f + 7] = t[7];
    }
    function o(l, a, f) {
      e[0] = l, a[f] = t[7], a[f + 1] = t[6], a[f + 2] = t[5], a[f + 3] = t[4], a[f + 4] = t[3], a[f + 5] = t[2], a[f + 6] = t[1], a[f + 7] = t[0];
    }
    i.writeDoubleLE = n ? r : o, i.writeDoubleBE = n ? o : r;
    function s(l, a) {
      return t[0] = l[a], t[1] = l[a + 1], t[2] = l[a + 2], t[3] = l[a + 3], t[4] = l[a + 4], t[5] = l[a + 5], t[6] = l[a + 6], t[7] = l[a + 7], e[0];
    }
    function u(l, a) {
      return t[7] = l[a], t[6] = l[a + 1], t[5] = l[a + 2], t[4] = l[a + 3], t[3] = l[a + 4], t[2] = l[a + 5], t[1] = l[a + 6], t[0] = l[a + 7], e[0];
    }
    i.readDoubleLE = n ? s : u, i.readDoubleBE = n ? u : s;
  }() : function() {
    function e(n, r, o, s, u, l) {
      var a = s < 0 ? 1 : 0;
      if (a && (s = -s), s === 0)
        n(0, u, l + r), n(1 / s > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), u, l + o);
      else if (isNaN(s))
        n(0, u, l + r), n(2146959360, u, l + o);
      else if (s > 17976931348623157e292)
        n(0, u, l + r), n((a << 31 | 2146435072) >>> 0, u, l + o);
      else {
        var f;
        if (s < 22250738585072014e-324)
          f = s / 5e-324, n(f >>> 0, u, l + r), n((a << 31 | f / 4294967296) >>> 0, u, l + o);
        else {
          var h = Math.floor(Math.log(s) / Math.LN2);
          h === 1024 && (h = 1023), f = s * Math.pow(2, -h), n(f * 4503599627370496 >>> 0, u, l + r), n((a << 31 | h + 1023 << 20 | f * 1048576 & 1048575) >>> 0, u, l + o);
        }
      }
    }
    i.writeDoubleLE = e.bind(null, writeUintLE, 0, 4), i.writeDoubleBE = e.bind(null, writeUintBE, 4, 0);
    function t(n, r, o, s, u) {
      var l = n(s, u + r), a = n(s, u + o), f = (a >> 31) * 2 + 1, h = a >>> 20 & 2047, d = 4294967296 * (a & 1048575) + l;
      return h === 2047 ? d ? NaN : f * (1 / 0) : h === 0 ? f * 5e-324 * d : f * Math.pow(2, h - 1075) * (d + 4503599627370496);
    }
    i.readDoubleLE = t.bind(null, readUintLE, 0, 4), i.readDoubleBE = t.bind(null, readUintBE, 4, 0);
  }(), i;
}
function writeUintLE(i, e, t) {
  e[t] = i & 255, e[t + 1] = i >>> 8 & 255, e[t + 2] = i >>> 16 & 255, e[t + 3] = i >>> 24;
}
function writeUintBE(i, e, t) {
  e[t] = i >>> 24, e[t + 1] = i >>> 16 & 255, e[t + 2] = i >>> 8 & 255, e[t + 3] = i & 255;
}
function readUintLE(i, e) {
  return (i[e] | i[e + 1] << 8 | i[e + 2] << 16 | i[e + 3] << 24) >>> 0;
}
function readUintBE(i, e) {
  return (i[e] << 24 | i[e + 1] << 16 | i[e + 2] << 8 | i[e + 3]) >>> 0;
}
var inquire_1 = inquire;
function inquire(moduleName) {
  try {
    var mod = eval("quire".replace(/^/, "re"))(moduleName);
    if (mod && (mod.length || Object.keys(mod).length))
      return mod;
  } catch (i) {
  }
  return null;
}
var utf8$2 = {};
(function(i) {
  var e = i;
  e.length = function(n) {
    for (var r = 0, o = 0, s = 0; s < n.length; ++s)
      o = n.charCodeAt(s), o < 128 ? r += 1 : o < 2048 ? r += 2 : (o & 64512) === 55296 && (n.charCodeAt(s + 1) & 64512) === 56320 ? (++s, r += 4) : r += 3;
    return r;
  }, e.read = function(n, r, o) {
    var s = o - r;
    if (s < 1)
      return "";
    for (var u = null, l = [], a = 0, f; r < o; )
      f = n[r++], f < 128 ? l[a++] = f : f > 191 && f < 224 ? l[a++] = (f & 31) << 6 | n[r++] & 63 : f > 239 && f < 365 ? (f = ((f & 7) << 18 | (n[r++] & 63) << 12 | (n[r++] & 63) << 6 | n[r++] & 63) - 65536, l[a++] = 55296 + (f >> 10), l[a++] = 56320 + (f & 1023)) : l[a++] = (f & 15) << 12 | (n[r++] & 63) << 6 | n[r++] & 63, a > 8191 && ((u || (u = [])).push(String.fromCharCode.apply(String, l)), a = 0);
    return u ? (a && u.push(String.fromCharCode.apply(String, l.slice(0, a))), u.join("")) : String.fromCharCode.apply(String, l.slice(0, a));
  }, e.write = function(n, r, o) {
    for (var s = o, u, l, a = 0; a < n.length; ++a)
      u = n.charCodeAt(a), u < 128 ? r[o++] = u : u < 2048 ? (r[o++] = u >> 6 | 192, r[o++] = u & 63 | 128) : (u & 64512) === 55296 && ((l = n.charCodeAt(a + 1)) & 64512) === 56320 ? (u = 65536 + ((u & 1023) << 10) + (l & 1023), ++a, r[o++] = u >> 18 | 240, r[o++] = u >> 12 & 63 | 128, r[o++] = u >> 6 & 63 | 128, r[o++] = u & 63 | 128) : (r[o++] = u >> 12 | 224, r[o++] = u >> 6 & 63 | 128, r[o++] = u & 63 | 128);
    return o - s;
  };
})(utf8$2);
var pool_1 = pool;
function pool(i, e, t) {
  var n = t || 8192, r = n >>> 1, o = null, s = n;
  return function(l) {
    if (l < 1 || l > r)
      return i(l);
    s + l > n && (o = i(n), s = 0);
    var a = e.call(o, s, s += l);
    return s & 7 && (s = (s | 7) + 1), a;
  };
}
var longbits, hasRequiredLongbits;
function requireLongbits() {
  if (hasRequiredLongbits)
    return longbits;
  hasRequiredLongbits = 1, longbits = e;
  var i = requireMinimal();
  function e(o, s) {
    this.lo = o >>> 0, this.hi = s >>> 0;
  }
  var t = e.zero = new e(0, 0);
  t.toNumber = function() {
    return 0;
  }, t.zzEncode = t.zzDecode = function() {
    return this;
  }, t.length = function() {
    return 1;
  };
  var n = e.zeroHash = "\0\0\0\0\0\0\0\0";
  e.fromNumber = function(s) {
    if (s === 0)
      return t;
    var u = s < 0;
    u && (s = -s);
    var l = s >>> 0, a = (s - l) / 4294967296 >>> 0;
    return u && (a = ~a >>> 0, l = ~l >>> 0, ++l > 4294967295 && (l = 0, ++a > 4294967295 && (a = 0))), new e(l, a);
  }, e.from = function(s) {
    if (typeof s == "number")
      return e.fromNumber(s);
    if (i.isString(s))
      if (i.Long)
        s = i.Long.fromString(s);
      else
        return e.fromNumber(parseInt(s, 10));
    return s.low || s.high ? new e(s.low >>> 0, s.high >>> 0) : t;
  }, e.prototype.toNumber = function(s) {
    if (!s && this.hi >>> 31) {
      var u = ~this.lo + 1 >>> 0, l = ~this.hi >>> 0;
      return u || (l = l + 1 >>> 0), -(u + l * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }, e.prototype.toLong = function(s) {
    return i.Long ? new i.Long(this.lo | 0, this.hi | 0, !!s) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!s };
  };
  var r = String.prototype.charCodeAt;
  return e.fromHash = function(s) {
    return s === n ? t : new e(
      (r.call(s, 0) | r.call(s, 1) << 8 | r.call(s, 2) << 16 | r.call(s, 3) << 24) >>> 0,
      (r.call(s, 4) | r.call(s, 5) << 8 | r.call(s, 6) << 16 | r.call(s, 7) << 24) >>> 0
    );
  }, e.prototype.toHash = function() {
    return String.fromCharCode(
      this.lo & 255,
      this.lo >>> 8 & 255,
      this.lo >>> 16 & 255,
      this.lo >>> 24,
      this.hi & 255,
      this.hi >>> 8 & 255,
      this.hi >>> 16 & 255,
      this.hi >>> 24
    );
  }, e.prototype.zzEncode = function() {
    var s = this.hi >> 31;
    return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ s) >>> 0, this.lo = (this.lo << 1 ^ s) >>> 0, this;
  }, e.prototype.zzDecode = function() {
    var s = -(this.lo & 1);
    return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ s) >>> 0, this.hi = (this.hi >>> 1 ^ s) >>> 0, this;
  }, e.prototype.length = function() {
    var s = this.lo, u = (this.lo >>> 28 | this.hi << 4) >>> 0, l = this.hi >>> 24;
    return l === 0 ? u === 0 ? s < 16384 ? s < 128 ? 1 : 2 : s < 2097152 ? 3 : 4 : u < 16384 ? u < 128 ? 5 : 6 : u < 2097152 ? 7 : 8 : l < 128 ? 9 : 10;
  }, longbits;
}
var hasRequiredMinimal;
function requireMinimal() {
  return hasRequiredMinimal || (hasRequiredMinimal = 1, function(i) {
    var e = i;
    e.asPromise = aspromise, e.base64 = base64$1, e.EventEmitter = eventemitter, e.float = float, e.inquire = inquire_1, e.utf8 = utf8$2, e.pool = pool_1, e.LongBits = requireLongbits(), e.isNode = !!(typeof commonjsGlobal < "u" && commonjsGlobal && commonjsGlobal.process && commonjsGlobal.process.versions && commonjsGlobal.process.versions.node), e.global = e.isNode && commonjsGlobal || typeof window < "u" && window || typeof self < "u" && self || commonjsGlobal, e.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    ), e.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    ), e.isInteger = Number.isInteger || /* istanbul ignore next */
    function(o) {
      return typeof o == "number" && isFinite(o) && Math.floor(o) === o;
    }, e.isString = function(o) {
      return typeof o == "string" || o instanceof String;
    }, e.isObject = function(o) {
      return o && typeof o == "object";
    }, e.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    e.isSet = function(o, s) {
      var u = o[s];
      return u != null && o.hasOwnProperty(s) ? typeof u != "object" || (Array.isArray(u) ? u.length : Object.keys(u).length) > 0 : !1;
    }, e.Buffer = function() {
      try {
        var r = e.inquire("buffer").Buffer;
        return r.prototype.utf8Write ? r : (
          /* istanbul ignore next */
          null
        );
      } catch {
        return null;
      }
    }(), e._Buffer_from = null, e._Buffer_allocUnsafe = null, e.newBuffer = function(o) {
      return typeof o == "number" ? e.Buffer ? e._Buffer_allocUnsafe(o) : new e.Array(o) : e.Buffer ? e._Buffer_from(o) : typeof Uint8Array > "u" ? o : new Uint8Array(o);
    }, e.Array = typeof Uint8Array < "u" ? Uint8Array : Array, e.Long = /* istanbul ignore next */
    e.global.dcodeIO && /* istanbul ignore next */
    e.global.dcodeIO.Long || /* istanbul ignore next */
    e.global.Long || e.inquire("long"), e.key2Re = /^true|false|0|1$/, e.key32Re = /^-?(?:0|[1-9][0-9]*)$/, e.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, e.longToHash = function(o) {
      return o ? e.LongBits.from(o).toHash() : e.LongBits.zeroHash;
    }, e.longFromHash = function(o, s) {
      var u = e.LongBits.fromHash(o);
      return e.Long ? e.Long.fromBits(u.lo, u.hi, s) : u.toNumber(!!s);
    };
    function t(r, o, s) {
      for (var u = Object.keys(o), l = 0; l < u.length; ++l)
        (r[u[l]] === void 0 || !s) && (r[u[l]] = o[u[l]]);
      return r;
    }
    e.merge = t, e.lcFirst = function(o) {
      return o.charAt(0).toLowerCase() + o.substring(1);
    };
    function n(r) {
      function o(s, u) {
        if (!(this instanceof o))
          return new o(s, u);
        Object.defineProperty(this, "message", { get: function() {
          return s;
        } }), Error.captureStackTrace ? Error.captureStackTrace(this, o) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), u && t(this, u);
      }
      return o.prototype = Object.create(Error.prototype, {
        constructor: {
          value: o,
          writable: !0,
          enumerable: !1,
          configurable: !0
        },
        name: {
          get: function() {
            return r;
          },
          set: void 0,
          enumerable: !1,
          // configurable: false would accurately preserve the behavior of
          // the original, but I'm guessing that was not intentional.
          // For an actual error subclass, this property would
          // be configurable.
          configurable: !0
        },
        toString: {
          value: function() {
            return this.name + ": " + this.message;
          },
          writable: !0,
          enumerable: !1,
          configurable: !0
        }
      }), o;
    }
    e.newError = n, e.ProtocolError = n("ProtocolError"), e.oneOfGetter = function(o) {
      for (var s = {}, u = 0; u < o.length; ++u)
        s[o[u]] = 1;
      return function() {
        for (var l = Object.keys(this), a = l.length - 1; a > -1; --a)
          if (s[l[a]] === 1 && this[l[a]] !== void 0 && this[l[a]] !== null)
            return l[a];
      };
    }, e.oneOfSetter = function(o) {
      return function(s) {
        for (var u = 0; u < o.length; ++u)
          o[u] !== s && delete this[o[u]];
      };
    }, e.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: !0
    }, e._configure = function() {
      var r = e.Buffer;
      if (!r) {
        e._Buffer_from = e._Buffer_allocUnsafe = null;
        return;
      }
      e._Buffer_from = r.from !== Uint8Array.from && r.from || /* istanbul ignore next */
      function(s, u) {
        return new r(s, u);
      }, e._Buffer_allocUnsafe = r.allocUnsafe || /* istanbul ignore next */
      function(s) {
        return new r(s);
      };
    };
  }(minimal$1)), minimal$1;
}
var writer = Writer$1, util$4 = requireMinimal(), BufferWriter$1, LongBits$1 = util$4.LongBits, base64 = util$4.base64, utf8$1 = util$4.utf8;
function Op(i, e, t) {
  this.fn = i, this.len = e, this.next = void 0, this.val = t;
}
function noop() {
}
function State(i) {
  this.head = i.head, this.tail = i.tail, this.len = i.len, this.next = i.states;
}
function Writer$1() {
  this.len = 0, this.head = new Op(noop, 0, 0), this.tail = this.head, this.states = null;
}
var create$1 = function i() {
  return util$4.Buffer ? function() {
    return (Writer$1.create = function() {
      return new BufferWriter$1();
    })();
  } : function() {
    return new Writer$1();
  };
};
Writer$1.create = create$1();
Writer$1.alloc = function i(e) {
  return new util$4.Array(e);
};
util$4.Array !== Array && (Writer$1.alloc = util$4.pool(Writer$1.alloc, util$4.Array.prototype.subarray));
Writer$1.prototype._push = function i(e, t, n) {
  return this.tail = this.tail.next = new Op(e, t, n), this.len += t, this;
};
function writeByte(i, e, t) {
  e[t] = i & 255;
}
function writeVarint32(i, e, t) {
  for (; i > 127; )
    e[t++] = i & 127 | 128, i >>>= 7;
  e[t] = i;
}
function VarintOp(i, e) {
  this.len = i, this.next = void 0, this.val = e;
}
VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;
Writer$1.prototype.uint32 = function i(e) {
  return this.len += (this.tail = this.tail.next = new VarintOp(
    (e = e >>> 0) < 128 ? 1 : e < 16384 ? 2 : e < 2097152 ? 3 : e < 268435456 ? 4 : 5,
    e
  )).len, this;
};
Writer$1.prototype.int32 = function i(e) {
  return e < 0 ? this._push(writeVarint64, 10, LongBits$1.fromNumber(e)) : this.uint32(e);
};
Writer$1.prototype.sint32 = function i(e) {
  return this.uint32((e << 1 ^ e >> 31) >>> 0);
};
function writeVarint64(i, e, t) {
  for (; i.hi; )
    e[t++] = i.lo & 127 | 128, i.lo = (i.lo >>> 7 | i.hi << 25) >>> 0, i.hi >>>= 7;
  for (; i.lo > 127; )
    e[t++] = i.lo & 127 | 128, i.lo = i.lo >>> 7;
  e[t++] = i.lo;
}
Writer$1.prototype.uint64 = function i(e) {
  var t = LongBits$1.from(e);
  return this._push(writeVarint64, t.length(), t);
};
Writer$1.prototype.int64 = Writer$1.prototype.uint64;
Writer$1.prototype.sint64 = function i(e) {
  var t = LongBits$1.from(e).zzEncode();
  return this._push(writeVarint64, t.length(), t);
};
Writer$1.prototype.bool = function i(e) {
  return this._push(writeByte, 1, e ? 1 : 0);
};
function writeFixed32(i, e, t) {
  e[t] = i & 255, e[t + 1] = i >>> 8 & 255, e[t + 2] = i >>> 16 & 255, e[t + 3] = i >>> 24;
}
Writer$1.prototype.fixed32 = function i(e) {
  return this._push(writeFixed32, 4, e >>> 0);
};
Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32;
Writer$1.prototype.fixed64 = function i(e) {
  var t = LongBits$1.from(e);
  return this._push(writeFixed32, 4, t.lo)._push(writeFixed32, 4, t.hi);
};
Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64;
Writer$1.prototype.float = function i(e) {
  return this._push(util$4.float.writeFloatLE, 4, e);
};
Writer$1.prototype.double = function i(e) {
  return this._push(util$4.float.writeDoubleLE, 8, e);
};
var writeBytes = util$4.Array.prototype.set ? function i(e, t, n) {
  t.set(e, n);
} : function i(e, t, n) {
  for (var r = 0; r < e.length; ++r)
    t[n + r] = e[r];
};
Writer$1.prototype.bytes = function i(e) {
  var t = e.length >>> 0;
  if (!t)
    return this._push(writeByte, 1, 0);
  if (util$4.isString(e)) {
    var n = Writer$1.alloc(t = base64.length(e));
    base64.decode(e, n, 0), e = n;
  }
  return this.uint32(t)._push(writeBytes, t, e);
};
Writer$1.prototype.string = function i(e) {
  var t = utf8$1.length(e);
  return t ? this.uint32(t)._push(utf8$1.write, t, e) : this._push(writeByte, 1, 0);
};
Writer$1.prototype.fork = function i() {
  return this.states = new State(this), this.head = this.tail = new Op(noop, 0, 0), this.len = 0, this;
};
Writer$1.prototype.reset = function i() {
  return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new Op(noop, 0, 0), this.len = 0), this;
};
Writer$1.prototype.ldelim = function i() {
  var e = this.head, t = this.tail, n = this.len;
  return this.reset().uint32(n), n && (this.tail.next = e.next, this.tail = t, this.len += n), this;
};
Writer$1.prototype.finish = function i() {
  for (var e = this.head.next, t = this.constructor.alloc(this.len), n = 0; e; )
    e.fn(e.val, t, n), n += e.len, e = e.next;
  return t;
};
Writer$1._configure = function(i) {
  BufferWriter$1 = i, Writer$1.create = create$1(), BufferWriter$1._configure();
};
var writer_buffer = BufferWriter, Writer = writer;
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
var util$3 = requireMinimal();
function BufferWriter() {
  Writer.call(this);
}
BufferWriter._configure = function() {
  BufferWriter.alloc = util$3._Buffer_allocUnsafe, BufferWriter.writeBytesBuffer = util$3.Buffer && util$3.Buffer.prototype instanceof Uint8Array && util$3.Buffer.prototype.set.name === "set" ? function(e, t, n) {
    t.set(e, n);
  } : function(e, t, n) {
    if (e.copy)
      e.copy(t, n, 0, e.length);
    else
      for (var r = 0; r < e.length; )
        t[n++] = e[r++];
  };
};
BufferWriter.prototype.bytes = function i(e) {
  util$3.isString(e) && (e = util$3._Buffer_from(e, "base64"));
  var t = e.length >>> 0;
  return this.uint32(t), t && this._push(BufferWriter.writeBytesBuffer, t, e), this;
};
function writeStringBuffer(i, e, t) {
  i.length < 40 ? util$3.utf8.write(i, e, t) : e.utf8Write ? e.utf8Write(i, t) : e.write(i, t);
}
BufferWriter.prototype.string = function i(e) {
  var t = util$3.Buffer.byteLength(e);
  return this.uint32(t), t && this._push(writeStringBuffer, t, e), this;
};
BufferWriter._configure();
var reader = Reader$1, util$2 = requireMinimal(), BufferReader$1, LongBits = util$2.LongBits, utf8 = util$2.utf8;
function indexOutOfRange(i, e) {
  return RangeError("index out of range: " + i.pos + " + " + (e || 1) + " > " + i.len);
}
function Reader$1(i) {
  this.buf = i, this.pos = 0, this.len = i.length;
}
var create_array = typeof Uint8Array < "u" ? function i(e) {
  if (e instanceof Uint8Array || Array.isArray(e))
    return new Reader$1(e);
  throw Error("illegal buffer");
} : function i(e) {
  if (Array.isArray(e))
    return new Reader$1(e);
  throw Error("illegal buffer");
}, create = function i() {
  return util$2.Buffer ? function(t) {
    return (Reader$1.create = function(r) {
      return util$2.Buffer.isBuffer(r) ? new BufferReader$1(r) : create_array(r);
    })(t);
  } : create_array;
};
Reader$1.create = create();
Reader$1.prototype._slice = util$2.Array.prototype.subarray || /* istanbul ignore next */
util$2.Array.prototype.slice;
Reader$1.prototype.uint32 = function i() {
  var e = 4294967295;
  return function() {
    if (e = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (e = (e | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (e = (e | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (e = (e | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (e = (e | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128))
      return e;
    if ((this.pos += 5) > this.len)
      throw this.pos = this.len, indexOutOfRange(this, 10);
    return e;
  };
}();
Reader$1.prototype.int32 = function i() {
  return this.uint32() | 0;
};
Reader$1.prototype.sint32 = function i() {
  var e = this.uint32();
  return e >>> 1 ^ -(e & 1) | 0;
};
function readLongVarint() {
  var i = new LongBits(0, 0), e = 0;
  if (this.len - this.pos > 4) {
    for (; e < 4; ++e)
      if (i.lo = (i.lo | (this.buf[this.pos] & 127) << e * 7) >>> 0, this.buf[this.pos++] < 128)
        return i;
    if (i.lo = (i.lo | (this.buf[this.pos] & 127) << 28) >>> 0, i.hi = (i.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
      return i;
    e = 0;
  } else {
    for (; e < 3; ++e) {
      if (this.pos >= this.len)
        throw indexOutOfRange(this);
      if (i.lo = (i.lo | (this.buf[this.pos] & 127) << e * 7) >>> 0, this.buf[this.pos++] < 128)
        return i;
    }
    return i.lo = (i.lo | (this.buf[this.pos++] & 127) << e * 7) >>> 0, i;
  }
  if (this.len - this.pos > 4) {
    for (; e < 5; ++e)
      if (i.hi = (i.hi | (this.buf[this.pos] & 127) << e * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
        return i;
  } else
    for (; e < 5; ++e) {
      if (this.pos >= this.len)
        throw indexOutOfRange(this);
      if (i.hi = (i.hi | (this.buf[this.pos] & 127) << e * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
        return i;
    }
  throw Error("invalid varint encoding");
}
Reader$1.prototype.bool = function i() {
  return this.uint32() !== 0;
};
function readFixed32_end(i, e) {
  return (i[e - 4] | i[e - 3] << 8 | i[e - 2] << 16 | i[e - 1] << 24) >>> 0;
}
Reader$1.prototype.fixed32 = function i() {
  if (this.pos + 4 > this.len)
    throw indexOutOfRange(this, 4);
  return readFixed32_end(this.buf, this.pos += 4);
};
Reader$1.prototype.sfixed32 = function i() {
  if (this.pos + 4 > this.len)
    throw indexOutOfRange(this, 4);
  return readFixed32_end(this.buf, this.pos += 4) | 0;
};
function readFixed64() {
  if (this.pos + 8 > this.len)
    throw indexOutOfRange(this, 8);
  return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}
Reader$1.prototype.float = function i() {
  if (this.pos + 4 > this.len)
    throw indexOutOfRange(this, 4);
  var e = util$2.float.readFloatLE(this.buf, this.pos);
  return this.pos += 4, e;
};
Reader$1.prototype.double = function i() {
  if (this.pos + 8 > this.len)
    throw indexOutOfRange(this, 4);
  var e = util$2.float.readDoubleLE(this.buf, this.pos);
  return this.pos += 8, e;
};
Reader$1.prototype.bytes = function i() {
  var e = this.uint32(), t = this.pos, n = this.pos + e;
  if (n > this.len)
    throw indexOutOfRange(this, e);
  if (this.pos += e, Array.isArray(this.buf))
    return this.buf.slice(t, n);
  if (t === n) {
    var r = util$2.Buffer;
    return r ? r.alloc(0) : new this.buf.constructor(0);
  }
  return this._slice.call(this.buf, t, n);
};
Reader$1.prototype.string = function i() {
  var e = this.bytes();
  return utf8.read(e, 0, e.length);
};
Reader$1.prototype.skip = function i(e) {
  if (typeof e == "number") {
    if (this.pos + e > this.len)
      throw indexOutOfRange(this, e);
    this.pos += e;
  } else
    do
      if (this.pos >= this.len)
        throw indexOutOfRange(this);
    while (this.buf[this.pos++] & 128);
  return this;
};
Reader$1.prototype.skipType = function(i) {
  switch (i) {
    case 0:
      this.skip();
      break;
    case 1:
      this.skip(8);
      break;
    case 2:
      this.skip(this.uint32());
      break;
    case 3:
      for (; (i = this.uint32() & 7) !== 4; )
        this.skipType(i);
      break;
    case 5:
      this.skip(4);
      break;
    default:
      throw Error("invalid wire type " + i + " at offset " + this.pos);
  }
  return this;
};
Reader$1._configure = function(i) {
  BufferReader$1 = i, Reader$1.create = create(), BufferReader$1._configure();
  var e = util$2.Long ? "toLong" : (
    /* istanbul ignore next */
    "toNumber"
  );
  util$2.merge(Reader$1.prototype, {
    int64: function() {
      return readLongVarint.call(this)[e](!1);
    },
    uint64: function() {
      return readLongVarint.call(this)[e](!0);
    },
    sint64: function() {
      return readLongVarint.call(this).zzDecode()[e](!1);
    },
    fixed64: function() {
      return readFixed64.call(this)[e](!0);
    },
    sfixed64: function() {
      return readFixed64.call(this)[e](!1);
    }
  });
};
var reader_buffer = BufferReader, Reader = reader;
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
var util$1 = requireMinimal();
function BufferReader(i) {
  Reader.call(this, i);
}
BufferReader._configure = function() {
  util$1.Buffer && (BufferReader.prototype._slice = util$1.Buffer.prototype.slice);
};
BufferReader.prototype.string = function i() {
  var e = this.uint32();
  return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + e, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + e, this.len));
};
BufferReader._configure();
var rpc = {}, service = Service, util = requireMinimal();
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;
function Service(i, e, t) {
  if (typeof i != "function")
    throw TypeError("rpcImpl must be a function");
  util.EventEmitter.call(this), this.rpcImpl = i, this.requestDelimited = !!e, this.responseDelimited = !!t;
}
Service.prototype.rpcCall = function i(e, t, n, r, o) {
  if (!r)
    throw TypeError("request must be specified");
  var s = this;
  if (!o)
    return util.asPromise(i, s, e, t, n, r);
  if (!s.rpcImpl) {
    setTimeout(function() {
      o(Error("already ended"));
    }, 0);
    return;
  }
  try {
    return s.rpcImpl(
      e,
      t[s.requestDelimited ? "encodeDelimited" : "encode"](r).finish(),
      function(l, a) {
        if (l)
          return s.emit("error", l, e), o(l);
        if (a === null) {
          s.end(
            /* endedByRPC */
            !0
          );
          return;
        }
        if (!(a instanceof n))
          try {
            a = n[s.responseDelimited ? "decodeDelimited" : "decode"](a);
          } catch (f) {
            return s.emit("error", f, e), o(f);
          }
        return s.emit("data", a, e), o(null, a);
      }
    );
  } catch (u) {
    s.emit("error", u, e), setTimeout(function() {
      o(u);
    }, 0);
    return;
  }
};
Service.prototype.end = function i(e) {
  return this.rpcImpl && (e || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
};
(function(i) {
  var e = i;
  e.Service = service;
})(rpc);
var roots = {};
(function(i) {
  var e = i;
  e.build = "minimal", e.Writer = writer, e.BufferWriter = writer_buffer, e.Reader = reader, e.BufferReader = reader_buffer, e.util = requireMinimal(), e.rpc = rpc, e.roots = roots, e.configure = t;
  function t() {
    e.util._configure(), e.Writer._configure(e.BufferWriter), e.Reader._configure(e.BufferReader);
  }
  t();
})(indexMinimal);
var minimal = indexMinimal;
const baseProfile = {
  comment: 0,
  defaultSampleType: 0,
  dropFrames: 0,
  durationNanos: 0,
  keepFrames: 0,
  period: 0,
  stringTable: "",
  timeNanos: 0
}, Profile = {
  encode(i, e = minimal.Writer.create()) {
    for (const t of i.sampleType)
      ValueType.encode(t, e.uint32(10).fork()).ldelim();
    for (const t of i.sample)
      Sample.encode(t, e.uint32(18).fork()).ldelim();
    for (const t of i.mapping)
      Mapping.encode(t, e.uint32(26).fork()).ldelim();
    for (const t of i.location)
      Location.encode(t, e.uint32(34).fork()).ldelim();
    for (const t of i.function)
      Function.encode(t, e.uint32(42).fork()).ldelim();
    for (const t of i.stringTable)
      e.uint32(50).string(t);
    i.dropFrames !== 0 && e.uint32(56).int64(i.dropFrames), i.keepFrames !== 0 && e.uint32(64).int64(i.keepFrames), i.timeNanos !== 0 && e.uint32(72).int64(i.timeNanos), i.durationNanos !== 0 && e.uint32(80).int64(i.durationNanos), i.periodType !== void 0 && ValueType.encode(i.periodType, e.uint32(90).fork()).ldelim(), i.period !== 0 && e.uint32(96).int64(i.period), e.uint32(106).fork();
    for (const t of i.comment)
      e.int64(t);
    return e.ldelim(), i.defaultSampleType !== 0 && e.uint32(112).int64(i.defaultSampleType), e;
  },
  fromPartial(i) {
    const e = { ...baseProfile };
    if (e.sampleType = [], e.sample = [], e.mapping = [], e.location = [], e.function = [], e.stringTable = [], e.comment = [], i.sampleType !== void 0 && i.sampleType !== null)
      for (const t of i.sampleType)
        e.sampleType.push(ValueType.fromPartial(t));
    if (i.sample !== void 0 && i.sample !== null)
      for (const t of i.sample)
        e.sample.push(Sample.fromPartial(t));
    if (i.mapping !== void 0 && i.mapping !== null)
      for (const t of i.mapping)
        e.mapping.push(Mapping.fromPartial(t));
    if (i.location !== void 0 && i.location !== null)
      for (const t of i.location)
        e.location.push(Location.fromPartial(t));
    if (i.function !== void 0 && i.function !== null)
      for (const t of i.function)
        e.function.push(Function.fromPartial(t));
    if (i.stringTable !== void 0 && i.stringTable !== null)
      for (const t of i.stringTable)
        e.stringTable.push(t);
    if (i.dropFrames !== void 0 && i.dropFrames !== null ? e.dropFrames = i.dropFrames : e.dropFrames = 0, i.keepFrames !== void 0 && i.keepFrames !== null ? e.keepFrames = i.keepFrames : e.keepFrames = 0, i.timeNanos !== void 0 && i.timeNanos !== null ? e.timeNanos = i.timeNanos : e.timeNanos = 0, i.durationNanos !== void 0 && i.durationNanos !== null ? e.durationNanos = i.durationNanos : e.durationNanos = 0, i.periodType !== void 0 && i.periodType !== null ? e.periodType = ValueType.fromPartial(i.periodType) : e.periodType = void 0, i.period !== void 0 && i.period !== null ? e.period = i.period : e.period = 0, i.comment !== void 0 && i.comment !== null)
      for (const t of i.comment)
        e.comment.push(t);
    return i.defaultSampleType !== void 0 && i.defaultSampleType !== null ? e.defaultSampleType = i.defaultSampleType : e.defaultSampleType = 0, e;
  }
}, baseValueType = { type: 0, unit: 0 }, ValueType = {
  encode(i, e = minimal.Writer.create()) {
    return i.type !== 0 && e.uint32(8).int64(i.type), i.unit !== 0 && e.uint32(16).int64(i.unit), e;
  },
  fromPartial(i) {
    const e = { ...baseValueType };
    return i.type !== void 0 && i.type !== null ? e.type = i.type : e.type = 0, i.unit !== void 0 && i.unit !== null ? e.unit = i.unit : e.unit = 0, e;
  }
}, baseSample = { locationId: 0, value: 0 }, Sample = {
  encode(i, e = minimal.Writer.create()) {
    e.uint32(10).fork();
    for (const t of i.locationId)
      e.uint64(t);
    e.ldelim(), e.uint32(18).fork();
    for (const t of i.value)
      e.int64(t);
    e.ldelim();
    for (const t of i.label)
      Label.encode(t, e.uint32(26).fork()).ldelim();
    return e;
  },
  fromPartial(i) {
    const e = { ...baseSample };
    if (e.locationId = [], e.value = [], e.label = [], i.locationId !== void 0 && i.locationId !== null)
      for (const t of i.locationId)
        e.locationId.push(t);
    if (i.value !== void 0 && i.value !== null)
      for (const t of i.value)
        e.value.push(t);
    if (i.label !== void 0 && i.label !== null)
      for (const t of i.label)
        e.label.push(Label.fromPartial(t));
    return e;
  }
}, baseLabel = { key: 0, num: 0, numUnit: 0, str: 0 }, Label = {
  encode(i, e = minimal.Writer.create()) {
    return i.key !== 0 && e.uint32(8).int64(i.key), i.str !== 0 && e.uint32(16).int64(i.str), i.num !== 0 && e.uint32(24).int64(i.num), i.numUnit !== 0 && e.uint32(32).int64(i.numUnit), e;
  },
  fromPartial(i) {
    const e = { ...baseLabel };
    return i.key !== void 0 && i.key !== null ? e.key = i.key : e.key = 0, i.str !== void 0 && i.str !== null ? e.str = i.str : e.str = 0, i.num !== void 0 && i.num !== null ? e.num = i.num : e.num = 0, i.numUnit !== void 0 && i.numUnit !== null ? e.numUnit = i.numUnit : e.numUnit = 0, e;
  }
}, baseMapping = {
  buildId: 0,
  fileOffset: 0,
  filename: 0,
  hasFilenames: !1,
  hasFunctions: !1,
  hasInlineFrames: !1,
  hasLineNumbers: !1,
  id: 0,
  memoryLimit: 0,
  memoryStart: 0
}, Mapping = {
  encode(i, e = minimal.Writer.create()) {
    return i.id !== 0 && e.uint32(8).uint64(i.id), i.memoryStart !== 0 && e.uint32(16).uint64(i.memoryStart), i.memoryLimit !== 0 && e.uint32(24).uint64(i.memoryLimit), i.fileOffset !== 0 && e.uint32(32).uint64(i.fileOffset), i.filename !== 0 && e.uint32(40).int64(i.filename), i.buildId !== 0 && e.uint32(48).int64(i.buildId), i.hasFunctions === !0 && e.uint32(56).bool(i.hasFunctions), i.hasFilenames === !0 && e.uint32(64).bool(i.hasFilenames), i.hasLineNumbers === !0 && e.uint32(72).bool(i.hasLineNumbers), i.hasInlineFrames === !0 && e.uint32(80).bool(i.hasInlineFrames), e;
  },
  fromPartial(i) {
    const e = { ...baseMapping };
    return i.id !== void 0 && i.id !== null ? e.id = i.id : e.id = 0, i.memoryStart !== void 0 && i.memoryStart !== null ? e.memoryStart = i.memoryStart : e.memoryStart = 0, i.memoryLimit !== void 0 && i.memoryLimit !== null ? e.memoryLimit = i.memoryLimit : e.memoryLimit = 0, i.fileOffset !== void 0 && i.fileOffset !== null ? e.fileOffset = i.fileOffset : e.fileOffset = 0, i.filename !== void 0 && i.filename !== null ? e.filename = i.filename : e.filename = 0, i.buildId !== void 0 && i.buildId !== null ? e.buildId = i.buildId : e.buildId = 0, i.hasFunctions !== void 0 && i.hasFunctions !== null ? e.hasFunctions = i.hasFunctions : e.hasFunctions = !1, i.hasFilenames !== void 0 && i.hasFilenames !== null ? e.hasFilenames = i.hasFilenames : e.hasFilenames = !1, i.hasLineNumbers !== void 0 && i.hasLineNumbers !== null ? e.hasLineNumbers = i.hasLineNumbers : e.hasLineNumbers = !1, i.hasInlineFrames !== void 0 && i.hasInlineFrames !== null ? e.hasInlineFrames = i.hasInlineFrames : e.hasInlineFrames = !1, e;
  }
}, baseLocation = {
  address: 0,
  id: 0,
  isFolded: !1,
  mappingId: 0
}, Location = {
  encode(i, e = minimal.Writer.create()) {
    i.id !== 0 && e.uint32(8).uint64(i.id), i.mappingId !== 0 && e.uint32(16).uint64(i.mappingId), i.address !== 0 && e.uint32(24).uint64(i.address);
    for (const t of i.line)
      Line.encode(t, e.uint32(34).fork()).ldelim();
    return i.isFolded === !0 && e.uint32(40).bool(i.isFolded), e;
  },
  fromPartial(i) {
    const e = { ...baseLocation };
    if (e.line = [], i.id !== void 0 && i.id !== null ? e.id = i.id : e.id = 0, i.mappingId !== void 0 && i.mappingId !== null ? e.mappingId = i.mappingId : e.mappingId = 0, i.address !== void 0 && i.address !== null ? e.address = i.address : e.address = 0, i.line !== void 0 && i.line !== null)
      for (const t of i.line)
        e.line.push(Line.fromPartial(t));
    return i.isFolded !== void 0 && i.isFolded !== null ? e.isFolded = i.isFolded : e.isFolded = !1, e;
  }
}, baseLine = { functionId: 0, line: 0 }, Line = {
  encode(i, e = minimal.Writer.create()) {
    return i.functionId !== 0 && e.uint32(8).uint64(i.functionId), (typeof i.line == "number" && i.line !== 0 || typeof i.line != "number" && (i.line.low !== 0 || i.line.high !== 0)) && e.uint32(16).int64(i.line), e;
  },
  fromPartial(i) {
    const e = { ...baseLine };
    return i.functionId !== void 0 && i.functionId !== null ? e.functionId = i.functionId : e.functionId = 0, i.line !== void 0 && i.line !== null ? e.line = i.line : e.line = 0, e;
  }
}, baseFunction = {
  filename: 0,
  id: 0,
  name: 0,
  startLine: 0,
  systemName: 0
}, Function = {
  encode(i, e = minimal.Writer.create()) {
    return i.id !== 0 && e.uint32(8).uint64(i.id), i.name !== 0 && e.uint32(16).int64(i.name), i.systemName !== 0 && e.uint32(24).int64(i.systemName), i.filename !== 0 && e.uint32(32).int64(i.filename), i.startLine !== 0 && e.uint32(40).int64(i.startLine), e;
  },
  fromPartial(i) {
    const e = { ...baseFunction };
    return i.id !== void 0 && i.id !== null ? e.id = i.id : e.id = 0, i.name !== void 0 && i.name !== null ? e.name = i.name : e.name = 0, i.systemName !== void 0 && i.systemName !== null ? e.systemName = i.systemName : e.systemName = 0, i.filename !== void 0 && i.filename !== null ? e.filename = i.filename : e.filename = 0, i.startLine !== void 0 && i.startLine !== null ? e.startLine = i.startLine : e.startLine = 0, e;
  }
}, ANONYMOUS_FUNCTION = "(anonymous)", exportToPprofIntake = (i, e) => {
  const t = buildPprof(i), n = extractAttributes(i, e);
  return sendPprof(new Date(i.timeOrigin + i.startTime), new Date(i.timeOrigin + i.endTime), t, e, n);
};
function buildPprof(i) {
  const e = new StringsTable(), t = [], n = [], r = [], o = new SamplesView(i), s = new LongTasksTimeline(i), u = new MeasuresTimeline(i), l = new EventsTimeline(i), a = new InteractionsTimeline(i), f = new NavigationTimeline(i);
  for (let p = 0; p < i.frames.length; p++) {
    const c = i.frames[p], R = c.resourceId !== void 0 ? e.dedup(i.resources[c.resourceId]) : 0, v = e.dedup(c.name || ANONYMOUS_FUNCTION), L = v;
    let g = t.findIndex((E) => E.filename === R && E.name === v && E.systemName === L);
    g === -1 && (g = t.length, t.push(Function.fromPartial({
      id: t.length + 1,
      filename: R,
      name: v,
      systemName: L
    }))), n.push(Location.fromPartial({
      id: n.length + 1,
      line: [
        Line.fromPartial({
          functionId: t[g].id,
          // encode column in high 32-bits of a 64-bit integer
          line: {
            high: c.column || 0,
            low: c.line || 0,
            unsigned: !0
          }
        })
      ]
    }));
  }
  if (i.samples.length)
    for (let p = 0; p < i.samples.length; p++) {
      const c = i.samples[p], R = [];
      let v = c.stackId;
      for (; v !== void 0; ) {
        const { frameId: m, parentId: C } = i.stacks[v];
        R.push(n[m].id), v = C;
      }
      if (R.length === 0)
        continue;
      const L = o.getStartTime(p), g = o.getMiddleTime(p), E = o.getEndTime(p), T = s.get(g), O = u.get(g), $ = l.get(g), k = a.get(g), S = f.get(g), y = [];
      if (T.length > 0)
        for (const m of T)
          y.push(Label.fromPartial({
            key: e.dedup("task"),
            str: e.dedup(`Long Task (${getLongTaskId(m)})`)
          }));
      else
        y.push(Label.fromPartial({
          key: e.dedup("task"),
          str: e.dedup("Short Tasks")
        }));
      for (const m of O)
        y.push(Label.fromPartial({
          key: e.dedup("measure"),
          str: e.dedup(m.name)
        }));
      for (const m of $)
        y.push(Label.fromPartial({
          key: e.dedup("event"),
          str: e.dedup(`${m.name} (${Math.round(m.startTime)})`)
        }));
      for (const m of k)
        y.push(Label.fromPartial({
          key: e.dedup("interaction"),
          str: e.dedup(`${m.interactionId}`)
        }));
      for (const m of S)
        y.push(Label.fromPartial({
          // Special label for aggregation by endpoint feature
          key: e.dedup("trace endpoint"),
          str: e.dedup(m.name)
        }));
      y.push(Label.fromPartial({
        // Special label for timeline feature
        key: e.dedup("end_timestamp_ns"),
        num: (i.timeOrigin + E) * 1e6
      }));
      const B = (E - L) * 1e6, x = T.length ? B : 0, I = 1;
      r.push(Sample.fromPartial({
        locationId: R,
        value: [B, x, I],
        label: y
      }));
    }
  const h = [
    ValueType.fromPartial({
      type: e.dedup("wall-time"),
      unit: e.dedup("nanoseconds")
    }),
    ValueType.fromPartial({
      type: e.dedup("long-task-time"),
      unit: e.dedup("nanoseconds")
    }),
    ValueType.fromPartial({
      type: e.dedup("sample"),
      unit: e.dedup("count")
    })
  ], d = ValueType.fromPartial({
    type: e.dedup("wall-time"),
    unit: e.dedup("nanoseconds")
  }), _ = Profile.fromPartial({
    sampleType: h,
    defaultSampleType: 0,
    periodType: d,
    period: i.sampleInterval * 1e6,
    durationNanos: (i.endTime - i.startTime) * 1e6,
    timeNanos: (i.timeOrigin + i.startTime) * 1e6,
    function: t,
    location: n,
    sample: r,
    stringTable: Array.from(e)
  });
  return new Blob([Profile.encode(_).finish()], {
    type: "application/octet-stream"
  });
}
function extractAttributes(i, e) {
  var s, u;
  const t = {
    application: {
      id: e.applicationId
    }
  }, n = (u = (s = getRum()) == null ? void 0 : s.getInternalContext()) == null ? void 0 : u.session_id;
  n && (t.session = {
    id: n
  });
  const r = Array.from(new Set(i.navigation.map((l) => l.name)));
  r.length && (t.view = {
    name: r
  });
  const o = i.longTasks.map((l) => getLongTaskId(l));
  return o.length && (t.context = {
    profile_long_task_id: o
  }), t;
}
function sendPprof(i, e, t, n, r = {}) {
  const o = [
    `service:${n.service}`,
    `version:${n.version}`,
    `env:${n.env || "unknown"}`,
    `application_id:${n.applicationId}`,
    "language:javascript",
    "runtime:chrome",
    "family:chrome",
    "format:pprof",
    // TODO: replace with RUM device id in the future
    `host:${navigator.userAgent.replace(/[^a-zA-Z0-9_\-:./]/g, "_").replace(/__/g, "_").toLowerCase().slice(0, 200)}`
  ];
  n.commitHash && o.push(`git.commit.sha:${n.commitHash}`), n.repositoryUrl && o.push(`git.repository_url:${n.repositoryUrl}`);
  const s = {
    ...r,
    attachments: ["wall-time.pprof"],
    start: i.toISOString(),
    end: e.toISOString(),
    family: "chrome",
    tags_profiler: o.join(",")
  }, u = new FormData();
  u.append("event", new Blob([JSON.stringify(s)], { type: "application/json" }), "event.json"), u.append("wall-time.pprof", t, "wall-time.pprof");
  const l = (f) => buildEndpoint(n.site, n.clientToken, "profile", [], f);
  return navigator.sendBeacon(l("beacon"), u) ? Promise.resolve() : fetch(l("fetch"), {
    method: "POST",
    body: u
  }).then(() => {
  });
}
function getNumberOfSamples(i) {
  let e = 0;
  for (const t of i)
    t.stackId !== void 0 && e++;
  return e;
}
const window_Profiler = window.Profiler, window_navigation = window.navigation, SAMPLE_INTERVAL_MS = 10, COLLECT_INTERVAL_MS = 6e4, MIN_PROFILE_DURATION_MS = 5e3, MIN_NUMBER_OF_SAMPLES = 50;
class RumProfiler {
  constructor(e) {
    this.config = e, this.session = { state: "stopped" }, this.startNextProfilerSession = () => {
      if (!window_Profiler)
        throw new Error("RUM Profiler is not supported in this browser.");
      this.collectProfilerSession(), this.session = {
        state: "running",
        startTime: performance.now(),
        // We have to create new Profiler instance for each session
        profiler: new window_Profiler({
          sampleInterval: SAMPLE_INTERVAL_MS,
          // Keep buffer size at 1.5 times of minimum required to collect data for a profiling session
          maxBufferSize: Math.round(COLLECT_INTERVAL_MS * 1.5 / SAMPLE_INTERVAL_MS)
        }),
        timeoutId: setTimeout(this.startNextProfilerSession, COLLECT_INTERVAL_MS),
        longTasks: [],
        measures: [],
        events: [],
        navigation: []
      }, this.session.profiler.addEventListener("samplebufferfull", this.handleSampleBufferFull);
    }, this.collectProfilerSession = () => {
      if (this.session.state !== "running")
        return Promise.resolve();
      this.handleEntries(this.observer.takeRecords()), this.collectNavigationEntry();
      const { startTime: t, longTasks: n, measures: r, events: o, navigation: s } = this.session, u = this.session.profiler.stop().then((l) => {
        const a = performance.now();
        if (!(a - t < MIN_PROFILE_DURATION_MS) && !(getNumberOfSamples(l.samples) < MIN_NUMBER_OF_SAMPLES))
          return this.handleProfilerTrace(
            // Enrich trace with time and session data
            Object.assign(l, {
              startTime: t,
              endTime: a,
              timeOrigin: performance.timeOrigin,
              longTasks: n,
              measures: r,
              events: o,
              navigation: s,
              sampleInterval: SAMPLE_INTERVAL_MS
            })
          );
      });
      return clearTimeout(this.session.timeoutId), this.session.profiler.removeEventListener("samplebufferfull", this.handleSampleBufferFull), u;
    }, this.stopProfilerSession = (t) => {
      if (this.session.state !== "running")
        return Promise.resolve();
      const n = this.collectProfilerSession();
      return this.session = { state: t }, n;
    }, this.collectNavigationEntry = () => {
      var n, r, o;
      if (this.session.state !== "running")
        return;
      const t = this.session;
      t.navigation.push({
        startTime: t.navigation.length ? t.navigation[t.navigation.length - 1].endTime : 0,
        endTime: performance.now(),
        name: ((o = (r = (n = getRum()) == null ? void 0 : n.getInternalContext()) == null ? void 0 : r.view) == null ? void 0 : o.name) || document.location.pathname
      });
    }, this.handleProfilerTrace = (t) => {
      performance.mark("rum.profiler.export_time_ms.start");
      const n = exportToPprofIntake(t, this.config);
      return performance.mark("rum.profiler.export_time_ms.end"), performance.measure("rum.profiler.export_time_ms", "rum.profiler.export_time_ms.start", "rum.profiler.export_time_ms.end"), n;
    }, this.handleSampleBufferFull = () => {
      this.startNextProfilerSession();
    }, this.handlePerformance = (t) => {
      this.handleEntries(t.getEntries());
    }, this.handleEntries = (t) => {
      if (this.session.state === "running") {
        for (const n of t)
          if (!(n.duration < SAMPLE_INTERVAL_MS))
            switch (n.entryType) {
              case "longtask":
                this.session.longTasks.push(n);
                break;
              case "measure":
                this.session.measures.push(n);
                break;
              case "event":
                this.session.events.push(n);
                break;
            }
      }
    }, this.handleNavigate = () => {
      this.collectNavigationEntry();
    }, this.handleVisibilityChange = () => {
      document.visibilityState === "hidden" && this.session.state === "running" ? this.stopProfilerSession("paused") : document.visibilityState === "visible" && this.session.state === "paused" && this.startNextProfilerSession();
    }, this.handleBeforeUnload = () => {
      this.stopProfilerSession("stopped");
    }, this.observer = new PerformanceObserver(this.handlePerformance);
  }
  get supported() {
    return window_Profiler !== void 0;
  }
  start() {
    this.session.state !== "running" && (this.observer.observe({ entryTypes: ["longtask", "measure", "event"] }), window.addEventListener("visibilitychange", this.handleVisibilityChange), window.addEventListener("beforeunload", this.handleBeforeUnload), window_navigation && window_navigation.addEventListener("navigate", this.handleNavigate), this.startNextProfilerSession());
  }
  stop() {
    const e = this.stopProfilerSession("stopped");
    return this.observer.disconnect(), window.removeEventListener("visibilitychange", this.handleVisibilityChange), window.removeEventListener("beforeunload", this.handleBeforeUnload), window_navigation && window_navigation.removeEventListener("navigate", this.handleNavigate), e;
  }
}
function shouldSample(i) {
  return i >= 100 ? !0 : i <= 0 ? !1 : Math.random() <= i / 100;
}
const DEFAULT_INTAKE = "datadoghq.com", DEFAULT_PROFILING_SAMPLE_RATE = 100;
function initRumProfiler({ applicationId: i, clientToken: e, service: t, version: n, env: r, site: o = DEFAULT_INTAKE, profilingSampleRate: s = DEFAULT_PROFILING_SAMPLE_RATE, commitHash: u, repositoryUrl: l }) {
  if (shouldSample(s)) {
    const a = new RumProfiler({
      applicationId: i,
      clientToken: e,
      service: t,
      version: n,
      env: r,
      site: o,
      commitHash: u,
      repositoryUrl: l
    });
    return a.start(), () => a.stop();
  }
  return () => Promise.resolve();
}
function beforeSend(i, e) {
  return i.type === "long_task" && (i.context || (i.context = {}), i.context.profile_long_task_id = getLongTaskId(e.performanceEntry)), !0;
}
export {
  beforeSend,
  initRumProfiler
};
