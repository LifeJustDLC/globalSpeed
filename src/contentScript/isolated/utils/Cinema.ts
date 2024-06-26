import { clamp } from "src/utils/helper";
import { Popover } from "./Popover";

const BLEED = 1 
const PADDING = 5 

export class Cinema extends Popover {
    released = false 
    obs: IntersectionObserver
    roundness = 10
    currentX: number
    currentY: number 
    index = 0
    static currentCinema: Cinema
    
    constructor(private video: HTMLElement, color: string, opacity: number, roundness: number) {
        super(true)
        Cinema.currentCinema?.release()
        Cinema.currentCinema = this 
        this.div.style.position = "fixed"
        this.div.style.margin = "0"
        this.div.style.width = "100vw"
        this.div.style.height = "100vh"
        this.div.style.border = "none"
        this.div.style.backgroundColor = color ?? "black"
        this.div.style.opacity = `${(opacity ?? 90) / 100}`
        this.roundness = roundness ?? this.roundness

        this.every()
        this.update(true)
        this.div.addEventListener("click", this.release)
    }
    every = () => {
        if (this.released) return 
        this.reposition()
        requestAnimationFrame(this.every)
    } 
    reposition = () => {
        this.index++ 
        const b = this.video.getBoundingClientRect()
        const height = clamp(0, window.innerHeight, b.top + b.height) - clamp(0, window.innerHeight, b.top)
        const width = clamp(0, window.innerWidth, b.left + b.width) - clamp(0, window.innerWidth, b.left)

        if ((this.video as HTMLMediaElement).ended || width < 150 || height < 150) return this.release()
        if (b.x === this.currentX && b.y === this.currentY) return 
        this.currentX = b.x 
        this.currentY = b.y

        if (document.fullscreenElement || (b.width / window.innerWidth > 0.95 && b.height / window.innerHeight > 0.95)) {
            this.release()
            return 
        }
        let top = b.y + BLEED
        let bottom = b.y + b.height - BLEED
        let left = b.x + BLEED
        let right = b.x + b.width - BLEED
        let radii = this.roundness 

        let xx = window.innerWidth
        let yy = window.innerHeight

        this.div.style.clipPath = `path("\
            M0,0V${yy}H${xx}V0H${xx / 2 - PADDING}V${top}\
            H${right - radii} A${radii},${radii},${0},${0},${1},${right},${top + radii}\
            V${bottom - radii} A${radii},${radii},${0},${0},${1},${right - radii},${bottom}\
            H${left + radii} A${radii},${radii},${0},${0},${1},${left},${bottom - radii}\
            V${top + radii} A${radii},${radii},${0},${0},${1},${left + radii},${top}\
            H${xx / 2 + PADDING}V0H0Z")`            
    }
   
    release = () => {
        if (this.released) return 
        this.released = true 
        this._release() 
        this.obs?.disconnect()
        delete this.obs
        if (Cinema.currentCinema === this) {
            delete Cinema.currentCinema
        }
    }
}

