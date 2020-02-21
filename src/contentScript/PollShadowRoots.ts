


/** Used to maintain a reference to all shadow roots */
export class PollShadowRoots {
  shadowRoots: ShadowRoot[] = []
  intervalId: number 
  listeners: Set<(added: ShadowRoot[], removed: ShadowRoot[]) => void> = new Set()
  released = false 
  constructor() {
    this.intervalId = setInterval(this.handleInterval, 5000)
    this.handleInterval()
  }
  release = () => {
    if (this.released) return 
    this.released = true 
    clearInterval(this.intervalId)
    delete this.shadowRoots
    delete this.listeners
  }
  handleInterval = () => {
    const newShadowRoots = getShadowRoots(document)
    
    const removed: ShadowRoot[] = []
    this.shadowRoots = this.shadowRoots.filter(root => {
      if (newShadowRoots.includes(root)) {
        return true 
      } 
      removed.push(root)
      return false 
    })
    
    const added: ShadowRoot[] = []
    newShadowRoots.forEach(root => {
      if (this.shadowRoots.includes(root)) {
        return 
      } else {
        added.push(root)
        this.shadowRoots.push(root)
      }
    })

    if (added.length + removed.length > 0) {
      this.listeners.forEach(listener => {
        listener(added, removed)
      })
    }
  }
  
  static common: PollShadowRoots
  static referenceCount = 0
  static getCommon() {
    PollShadowRoots.referenceCount++
    PollShadowRoots.common = PollShadowRoots.common || new PollShadowRoots()
    return PollShadowRoots.common 
  }
  static releaseCommon() {
    PollShadowRoots.referenceCount--
    if (PollShadowRoots.referenceCount <= 0) {
      PollShadowRoots.common.release()
      delete PollShadowRoots.common
    }
  }
}

export function getShadowRoots(doc: Document | ShadowRoot, arr: ShadowRoot[] = []) {
  
  doc.querySelectorAll("*").forEach(node => {
    if (node.shadowRoot?.mode === "open") {
      arr.push(node.shadowRoot)
      getShadowRoots(node.shadowRoot, arr)
    }
  })
  return arr 
}
