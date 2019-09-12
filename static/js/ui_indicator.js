class IndicatorInterface {
	
	constructor() {
		this.root = document.getElementById('api_indicator_root')
		
		this.lights = []
		this.lights.push(document.getElementById('api_indicator_0'))
		this.lights.push(document.getElementById('api_indicator_1'))
		this.lights.push(document.getElementById('api_indicator_2'))
		this.lights.push(document.getElementById('api_indicator_3'))
		this.lights.push(document.getElementById('api_indicator_4'))
		
		this.lights[0].lightColor = '#F00'
		this.lights[1].lightColor = '#FF0'
		this.lights[2].lightColor = '#0F0'
		this.lights[3].lightColor = '#00F'
		this.lights[4].lightColor = '#F0F'
	}
	
	color(idx, color) {
		this.lights[idx].lightColor = color
	}
	
	on(idx) { this.lights[idx].style.backgroundColor = this.lights[idx].lightColor }
	off(idx) { this.lights[idx].style.backgroundColor = '' }
	
	toggle(idx) { if (this.lights[idx].style.backgroundColor === '') this.on(idx); else this.off(idx) }
	
	clear(idx) {
		if (this.lights[idx].lightInterval) {
			clearInterval(this.lights[idx].lightInterval)
			this.lights[idx].lightInterval = null
		}
		if (this.lights[idx].lightTimeout) {
			clearTimeout(this.lights[idx].lightTimeout)
			this.lights[idx].lightTimeout = null
		}
		this.off(idx)
	}
	
	flash(idx, interval = 500) {
		this.clear(idx)
		this.on(idx)
		this.lights[idx].lightInterval = setInterval(()=>{this.toggle(idx)}, interval)
	}
	
	pulse(idx, timeout = 1000) {
		this.clear(idx)
		this.on(idx)
		this.lights[idx].lightTimeout = setTimeout(()=>{this.off(idx)}, timeout)
	}
	
	spazOut(idx, timeout = 100) {
		this.toggle(idx);
		this.lights[idx].lightTimeout = setTimeout(()=>{this.spazOut(idx, Math.random() * 100)}, timeout)
	}
	
	spazOutMega(idx, timeout = 100) {
		this.toggle(idx);
		this.color(idx, hslToRgb(Math.random(), 1, 0.5))
		this.lights[idx].lightTimeout = setTimeout(()=>{this.spazOutMega(idx, Math.random() * 100)}, timeout)
	}
}
