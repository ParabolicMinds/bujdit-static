//Declarations

//The web address of the API
api				=	'https://bujdit.dogi.us/api'

//The page title in the browser
title			=	'Bujdit - Better than a budget'

//Number of milliseconds for an error message to stay on-screen. Messages will also go away if clicked/tapped
errorTimeout		=	5000
monkeyAngerTimeout	=	180000		//3 minutes
monkeyAngerTimeout	=	30000		//30 seconds
monkeyAngerLevel	=	0			//Start the monkey with no anger
angryLevel			=	5
furiousLevel		=	8
moneyMonkeyFurious	=	false
weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
bg_hue = 0

document.title = title
let awaitingResponse = false

let indicators = null

//This object contains a list of all the errors from the API by number
let error_codes = {
// GENERIC
0: 'Success!',
1: 'Unknown',
2: 'Unrecognized command!',
3: 'Invalid session token!',
4: 'Authorization required!',

// ACCOUNT
100: 'Username and password required!',
101: 'Invalid username!',
102: 'Invalid password!',

// BUJDIT
200: 'Bujdit not found!',
201: 'Name required!'
}



class Bujdit {
	
	constructor() {
		this.data = {}
		
		let split = window.location.href.split('?data=')
		if (split.length < 2) return
		this.data = JSON.parse(atob(split[1]))
	}
	
	change_form(new_form) {		window.location = '/' + new_form + '?data=' + btoa(JSON.stringify(this.data))
	}
	
}

function parseCurrency(inputObject) {
    if(isNaN(inputObject.value) || inputObject.value == "" || inputObject.value < 0)
    {
		flashRed(inputObject)
		return
	}
    inputObject.value = parseFloat(inputObject.value).toFixed(2);
	if(inputObject.value == 0)
	{
		flashRed(inputObject)
		return
	}
}

function checkExist(inputValue)
{
	if(document.getElementById(inputValue) == null)
	{
		return false;
	}
	return true;
}

function checkEmpty(inputValue)
{
	if(document.getElementById(inputValue).value == "")
	{
		return false;
	}
	return true;
}

function getData(inputValue)
{
	return document.getElementById(inputValue).value
}

function flashRed(inputObject)
{
	let temp = inputObject.className
	temp = temp.replace('flashRedBackground', '')
	temp = temp.trim()
	inputObject.className = temp
	inputObject.focus()
	setTimeout(function() { inputObject.className += ' flashRedBackground' }, 100)
}

//This function enables the "custom" text box for the user to type in
function checkForCustomValue(inputObject)
{
	let temp = inputObject.id + "Custom"
	document.getElementById(temp).className = "hidden"
	if(inputObject.value == "New...")
	{
		document.getElementById(temp).className = ""
		setFocus(temp)
	}
}

function sendCommands(cmds, callbacks)
{
	let send_data = {cmds:cmds}
	
	let token = localStorage.getItem('session')
	if (token) send_data.session = token
	
	let xhr = new XMLHttpRequest()
	xhr.open('POST', api, true)
	xhr.setRequestHeader('Content-Type', 'application/json');
	
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4)
		{
			unlockPage()
			if(xhr.status === 200)
			{
				indicators.pulse(2, 500)
				let data = JSON.parse(xhr.responseText);
				if(data.success)
				{
					if(data.res.length)
					{
						for(let i = 0; i < data.res.length; i++)
						{
							callbacks[i](data.res[i])
						}
					}
					else
					{
						callbacks[0](data)
					}
				}
				else
				{
					switch(data.code) {
						case 3:
							//Invalid session tokens require a new login session
							localStorage.removeItem('session')
							renderLoginPage()
							break
						default:
							displayError(data.code)
					}
				}
			}
			else
			{
				displayError('Non-OK response from API server, contact an administrator or something idk (Code: ' + xhr.status + ')')
			}
		}
	};
	
	xhr.onerror = () => {
		unlockPage()
		displayError('Could not connect to API server!')
	}
	
	lockPage()
	xhr.send(JSON.stringify(send_data))
}

function sendCommand(cmd, callback) {
	sendCommands([cmd], [callback])
}

function logoutButton()
{
	localStorage.removeItem('session')
	sendCommand( {cmd: "user_logout"}, renderLoginPage)
window.location.hash = ''
}

function loginButton()
{
	if(awaitingResponse) return
	let username = document.getElementById('bujditUsername').value
	let password = document.getElementById('bujditPassword').value
	if(username == '')
	{
		flashRed(bujditUsername)
		return
	}
	if(password == '')
	{
		flashRed(bujditPassword)
		return
	}
	let command = {
		cmd: 'user_login',
		username: username,
		password: password
	}
	sendCommand(command, processLoginResponse)
}

function processLoginResponse(inputData)
{
	if(inputData && inputData.success)
	{
		localStorage.setItem('session', inputData.token)
		selectPageToRender()
	}
	else
	{
		displayError(inputData.code)

		if(inputData.code == 11)
		{
			flashRed(bujditUsername)
		}
		if(inputData.code == 12)
		{
			flashRed(bujditPassword)
		}
	}
}

function selectPageToRender()
{
	closeModal()
	clearPage()
	renderAppbay()
	let temp = window.location.hash
	temp = temp.split('/')[0]
	switch(temp)
	{
		case '#calednarMenu':
			renderCalednarPage()
			break
		case '#payrolsMenu':
			renderPayrolPage()
			break
		case '#frendsMenu':
			renderFrendsPage()
			break
		case '#messgaesMenu':
			renderMessgaesPage()
			break
		case '#setingsMenu':
			renderSetingsPage()
			break
		case '#bujditsMenu':
			renderBujditsPage()
			break
		case '#reportsMenu':
			renderReportsPage()
			break
		case '#shnoppingListMenu':
			renderShnoppingListPage()
			break
		case '#mainMenu':
		case '#':
		case '':
		default:
			renderMainMenu()
	}
}

function removeClassname(inputObject, removeText)
{
	let temp = inputObject.className
	temp = temp.replace(removeText, '')
	temp = temp.replace('  ', ' ')
	temp = temp.trim()
	inputObject.className = temp
}

function lockPage()
{
	awaitingResponse = true
	indicators.flash(1, 100)
	setPageDisabledStatus(approot, true)
	setPageDisabledStatus(modalroot, true)
}

function unlockPage()
{
	awaitingResponse = false
	setPageDisabledStatus(approot, false)
	setPageDisabledStatus(modalroot, false)
	indicators.clear(1)
}

function setPageDisabledStatus(inputItem, newStatus)
{
	//False will disable the affected elements. True will enable them.
	for (let i = inputItem.children.length - 1; i >= 0; i--)
	{
		let c = inputItem.children[i]
		if (c.hasChildNodes)
		{
			setPageDisabledStatus(c, newStatus)
			continue
		}
		if (c.type == 'button' || c.type == 'input' )
		{
			if(c.skip && c.skip == true)
			{
				continue
			}
			c.disabled = newStatus
		}
	}
}

function clear_element(e) {
	for (let i = e.children.length - 1; i >= 0; i--)
	{
		let c = e.children[i]
		if (c.id == 'errorDiv') continue;
		e.removeChild(c)
	}
}

function changeStarredStatus(itemName, itemID, newStatus)
{
	let command = itemName + '_user_meta_set'
	switch(itemName)
	{
		case 'bujdits':
			command = 'bujdit_user_meta_set'
			break
	}
	sendCommand( { cmd: command, id: itemID, field: 'starred', meta: newStatus }, processStarStatusChange)
}

function chooseClickedItemToEnter(inputItem, itemID)
{
	switch(itemName)
	{
		case 'bujdits':
			sendCommand( { cmd: command, id: itemID }, selectPageToRender)
			break
	}
	displayError('Not implemented yet!')
}

function processStarStatusChange(data)
{
	if(data.success == false)
	{
		displayError('Operation failed!')
	}
	else
	{
		selectPageToRender()
	}
}

function parseDataResponseList(data, itemName, classNameForElements, nothingFoundMessage)
{
	let buttonDiv = createElement( {elementType: 'div', id: 'mainButtonDiv' })
	if(data !== 1 && data && data[itemName].length > 0)		//REMOVE THE DATA !== 1 COMPARISON WHEN THE REST OF THE MENU OPTIONS HAVE BEEN ADDED
	{
		data = sortData(data, itemName)
		for(let i = 0; i < data[itemName].length; i++)
		{
			//These declarations are necessary so the stuff below doesn't freak out
			if(!data[itemName][i].meta) data[itemName][i].meta = {}
			if(!data[itemName][i].meta.userColor) data[itemName][i].meta.userColor = ''

			if(data[itemName][i].user_meta && data[itemName][i].user_meta.starred == true)
			{
				buttonDiv.appendChild(createElement({ elementType: 'div', style: {backgroundColor: data[itemName][i].meta.userColor}, className: 'menuButton ' + classNameForElements, onclick: ()=>{renderDeleteBujditModal(data[itemName][i].id, data[itemName][i].name)}, bujdit_id: data[itemName][i].id, children: [
					{ elementType: 'div', className: 'star highlighted', text: '★', onclick: (evt)=>{ evt.stopPropagation(); changeStarredStatus(itemName, data[itemName][i].id, false)} },
					{ elementType: 'span', className: 'ellipsis', text: data[itemName][i].name }
				]}))
			}
			else
			{
				buttonDiv.appendChild(createElement({ elementType: 'div', style: {backgroundColor: data[itemName][i].meta.userColor}, className: 'menuButton ' + classNameForElements, onclick: ()=>{renderDeleteBujditModal(data[itemName][i].id, data[itemName][i].name)}, bujdit_id: data[itemName][i].id, children: [
					{ elementType: 'div', className: 'star', text: '☆', onclick: (evt)=>{ evt.stopPropagation(); changeStarredStatus(itemName, data[itemName][i].id, true)} },
					{ elementType: 'span', className: 'ellipsis', text: data[itemName][i].name }
				]}))
			}
		}
	}
	else
	{
		//No stuff! Berate the user.
		rootDiv.appendChild(createElement({ elementType: 'h3', className: 'nothingFound', text: nothingFoundMessage }))
		rootDiv.appendChild(createElement({ elementType: 'div', className: 'nothingFoundMonkey' }))
	}
	return buttonDiv
}

function sortData(data, itemName)
{
    data[itemName].sort((a, b)=>{
		let aname = a.name.toLowerCase()
		let bname = b.name.toLowerCase()
		aname = aname.trim()
		bname = bname.trim()
		let aStarred = false
		let bStarred = false
		if(a.user_meta && a.user_meta.starred) aStarred = true
		if(b.user_meta && b.user_meta.starred) bStarred = true
		if (aStarred && !bStarred) return -1
		if (!aStarred && bStarred) return 1
		if (aname < bname) return -1
		if (aname > bname) return 1
		return 0
	})
	return data
}

function createElement(inputValues)
{
	let new_element = null
	if(inputValues && inputValues.elementType)
	{
		new_element = document.createElement(inputValues.elementType)
		for (var key in inputValues)
		{
			switch(key) {
				case 'elementType':
					continue
				case 'style':
					for(let styleKey in inputValues.style)
					{
							 new_element.style[styleKey] = inputValues.style[styleKey]
					}
					break
				case 'text':
					if(inputValues.elementType == 'div')
					{
						let text_element = document.createElement('span')
						text_element.appendChild(document.createTextNode(inputValues[key]))
						new_element.appendChild(text_element)

					}
					else
					{
						new_element.appendChild(document.createTextNode(inputValues[key]))
					}
					break
				case 'children':
					for (let i = 0; i < inputValues.children.length; i++) {
						new_element.appendChild(createElement(inputValues.children[i]))
					}
					break
				default:
					new_element[key] = inputValues[key]
			}
		}
	}
	return new_element
}

function addElementToBody(inputValues)
{
	if(inputValues)	approot.appendChild(createElement(inputValues))
}

function addElementToRootDiv(inputValues)
{
	if(inputValues)	rootDiv.appendChild(createElement(inputValues))
}

function clearPage()
{
	clear_element(approot)
}

document.addEventListener("DOMContentLoaded", function(event)
{
	//Send a heartbeat to the API every so often to make keep users from logging out
	setInterval(heartbeat, 900000);

	window.onhashchange = selectPageToRender

	errorDiv.errorTimer = null
	errorDiv.monkeyAngerTimer = null
	
	modal.onclick = (evt)=>{evt.stopPropagation()}
	modalroot.onclick = (evt)=>{closeModal()}
	
	indicators = new IndicatorInterface()

	//We need to check if the session is valid before continuing.
	if (localStorage.getItem('session'))
	{
		sendCommands([], [checkTokenValid])
	}
	else
	{
		renderLoginPage()
	}
	
})

function heartbeat()
{
	if (localStorage.getItem('session'))
	{
		sendCommand({}, console.log)
	}
}

function checkTokenValid(data)
{
	if(data.success)
	{
		selectPageToRender()
	}
	else
	{
		renderLoginPage()
	}
}

function increaseMonkeyAnger()
{
	clearTimeout(errorDiv.monkeyAngerTimer)
	monkeyAngerLevel++
	if(monkeyAngerLevel > 11) monkeyAngerLevel = 11
	errorDiv.monkeyAngerTimer = setTimeout(decreaseMonkeyAnger, monkeyAngerTimeout)	if(monkeyAngerLevel > furiousLevel) {
		moneyMonkeyFurious = true
		indicators.flash(4, 200)
	}
}

function decreaseMonkeyAnger()
{
	clearTimeout(errorDiv.monkeyAngerTimer)
	monkeyAngerLevel--
	if(monkeyAngerLevel < 0) monkeyAngerLevel = 0
	if(monkeyAngerLevel > furiousLevel) {
		displayMessage('Grrrrrrr...')
		indicators.flash(4, 200)
	}
	if(monkeyAngerLevel == angryLevel && moneyMonkeyFurious == true)
	{
		displayMessage('Okay, I\'m better now.')
		moneyMonkeyFurious = false
		indicators.clear(4)
	}
}

function displayError(error)
{

	unlockPage()
	indicators.pulse(0, 3000)	increaseMonkeyAnger()
	displayMessage(error)
}

function displayMessage(message)
{
clearTimeout(errorDiv.monkeyAngerTimer)
	if(monkeyAngerLevel > 0) errorDiv.monkeyAngerTimer = setTimeout(decreaseMonkeyAnger, monkeyAngerTimeout)
	clear_element(errorDiv)
	errorDiv.style.display = ''
	if(monkeyAngerLevel > furiousLevel)
	{
		//Furious monkey
		errorDiv.appendChild(createElement( {elementType: 'div', className: 'errorMonkey furiousMonkey', text: '' } ))
	}
	else
	{
		if(monkeyAngerLevel > angryLevel)
		{
			//Angry monkey
			errorDiv.appendChild(createElement( {elementType: 'div', className: 'errorMonkey angryMonkey', text: '' } ))
		}
		else
		{
			//Default appearance
			errorDiv.appendChild(createElement( {elementType: 'div', className: 'errorMonkey', text: '' } ))
		}
	}

	//If the error message is an integer, we need to get the message from the error list. Otherwise, serve up what we were given
	if(!isNaN(message))
	{
		if(message in error_codes)
		{
			errorDiv.appendChild(createElement( {elementType: 'span', className: 'speechBubble', text: error_codes[message] } ))
		}
		else
		{
			errorDiv.appendChild(createElement( {elementType: 'span', className: 'speechBubble', text: 'Unknown error: ' + message } ))
		}
	}
	else
	{
		errorDiv.appendChild(createElement( {elementType: 'span', className: 'speechBubble', text: message} ))
	}
	errorDiv.style.transform = 'translateY(0%)'
	clearTimeout(errorDiv.errorTimer)	
	errorDiv.errorTimer = setTimeout(clearError, errorTimeout)
}

function clearError()
{
	clearTimeout(errorDiv.errorTimer)
	errorDiv.style.transform = ''
}

function clickError()
{
	increaseMonkeyAnger()
	errorDiv.appendChild(createElement( {elementType: 'div', className: 'errorMonkey', text: '' } ))
	displayMessage('Ouch!')
	clearTimeout(errorDiv.errorTimer)
	errorDiv.errorTimer = setTimeout(clearError, errorTimeout)
	clearError()
}

function deleteBujdit(inputValue)
{
	if(inputValue)
	{
		sendCommand({ cmd: 'bujdit_delete', id: inputValue }, checkModalFormSuccess)
	}
}

function checkModalFormSuccess(data)
{
	if(data.success)
	{
		displayMessage('Command successful!')
		selectPageToRender()
	}
	else
	{
		displayError('Command(s) failed to execute!')
	}
}

function gotoMainMenu()
{
	if(localStorage.getItem('session')) window.location.hash = ''
}

function hslToRgb(h, s, l) {
	var r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;

		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return 'rgb(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ')';
}

function flavorizePage(input1, input2, input3)
{
	let bg_hue = randRange(input1, input2)

	approot.style.backgroundColor = hslToRgb(bg_hue, input3, 0.2)
	appsep.style.backgroundColor = hslToRgb(bg_hue - 1./3., input3, 0.5)
	return bg_hue
}

function randRange(min, max) {
	return Math.random() * (max - min) + min
}

function changeMonth(change)
{
	let temp = window.location.hash
	let tempDate = new Date()
	let tempYear = tempDate.getFullYear()
	let tempMonth = tempDate.getMonth()
	if(temp.search('/') !== -1)
	{
		temp = temp.split('/')
		if(temp.length > 1) tempYear = parseFloat(temp[1])
		if(temp.length > 2) tempMonth = parseFloat(temp[2]) + change
	}
	else
	{
		tempMonth = tempMonth + change
	}
	if(tempMonth < 0)
	{
		tempYear--
		tempMonth = 11
	}
	if(tempMonth > 11)
	{
		tempYear++
		tempMonth = 0
	}
	tempYear = tempYear.toString()
	tempMonth = tempMonth.toString()
	window.location.hash = 'calednarMenu/' + tempYear + '/' + tempMonth
}

function appendText(inputObject, textToAdd)
{
	if(inputObject.text)
	{
		inputObject.text = inputObject.text + ' ' + textToAdd
	}
	else
	{
		inputObject.text = textToAdd
	}
	return inputObject
}

function calculateEvents(inputYear)
{

	let events = {}
	events.holidays = { color: '#4B4', dates: [] }
	events.federalHolidays = { color: '#B44', dates: [] }
	events.importantDays = { color: '#77F', dates: [] }


	//DAYS ARE GIVEN ON AN INDEX OF 1-7 INTO THESE FUNCTIONS
	//MONTHS ARE GIVEN ON AN INDEX OF 1-12
	//Dates are put in as year/month/day. Always use inputYear to calculate a holiday, unless it only takes place on specific years

	//FEDERAL HOLIDAYS
	events.federalHolidays.dates.push({ date: calculateSetDay(inputYear, 1, 1), name: "New Year's Day" })
	events.federalHolidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 1, 2, 3), name: "Martin Luther King Jr. Day" })
	events.federalHolidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 2, 2, 3), name: "Presidents' Day" })
	events.federalHolidays.dates.push({ date: calculateLastDayOfMonth(inputYear, 5, 2), name: "Memorial Day" })
	events.federalHolidays.dates.push({ date: calculateSetDay(inputYear, 7, 4), name: "Independence Day" })
	events.federalHolidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 9, 2, 1), name: "Labor Day" })
	events.federalHolidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 10, 2, 2), name: "Columbus Day" })
	events.federalHolidays.dates.push({ date: calculateSetDay(inputYear, 11, 11), name: "Veteran's Day" })
	let thanksgivingDay = calculateRepeatDayOfMonth(inputYear, 11, 5, 4)
	events.federalHolidays.dates.push({ date: thanksgivingDay, name: "Thanksgiving Day" })
	events.federalHolidays.dates.push({ date: calculateSetDay(inputYear, 12, 25), name: "Christmas Day" })


	//NON-FEDERAL HOLIDAYS
	events.holidays.dates.push({ date: calculateSetDay(inputYear, 2, 14), name: "Valentine's Day" })
	events.holidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 5, 1, 2), name: "Mother's Day" })
	events.holidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 6, 1, 3), name: "Father's Day" })
	events.holidays.dates.push({ date: calculateSetDay(inputYear, 10, 31), name: "Halloween" })


	//IMPORTANT DAYS (Non-holidays)
	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 3, 6, 1), name: "Employee Appreciation Day" })
	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 3, 1, 2), name: "Daylight Savings Time Begins" })
	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 11, 1, 1), name: "Daylight Savings Time Ends" })

	let blackFriday = new Date(thanksgivingDay.getFullYear(), thanksgivingDay.getMonth(), thanksgivingDay.getDate())
	blackFriday.setDate(blackFriday.getDate() + 1)
	events.importantDays.dates.push({ date: blackFriday, name: "Black Friday" })

	let cyberMonday = new Date(thanksgivingDay.getFullYear(), thanksgivingDay.getMonth(), thanksgivingDay.getDate())
	cyberMonday.setDate(cyberMonday.getDate() + 4)
	events.importantDays.dates.push({ date: cyberMonday, name: "Cyber Monday" })

	
	//Tax Day
	events.importantDays.dates.push({ date: calculateSetDay(inputYear, 4, 15, true), name: "Tax Day" })


	//Election Day
	if (!(inputYear % 2))
	{
		let electionDay = calculateRepeatDayOfMonth(inputYear, 11, 2, 1)
		electionDay.setDate(electionDay.getDate() + 1)
		events.importantDays.dates.push({ date: electionDay, name: "Election Day" })
	}

/*
	if (!(inputYear % 2)) {
		let election_day = createDate(inputYear, 11, 1)
		if (election_day.getDay() < 2) {
			election_day = createDate(inputYear, 11, 3 - election_day.getDay())
		} else if (election_day.getDay() == 2) {
			election_day = createDate(inputYear, 11, 8)
		} else {
			election_day = createDate(inputYear, 11, 10 - election_day.getDay())
		}

		events.importantDays.dates.push({ date: election_day, name: "Election Day" })
	}
*/
	events.holidays.dates.push({ date: calculateEaster(inputYear), name: "Easter" })

	return events
}

function calculateSetDay(inputYear, inputMonth, inputDay, skipWeekends = false)
{
	let testDate = createDate(inputYear, inputMonth, inputDay)
	if(skipWeekends == true)
	{
		if(testDate.getDay() == 6)
		{
			//Day falls on a Saturday. Increment the day by two.
			testDate.setDate(testDate.getDate() + 2)
		}
		else if(testDate.getDay() == 0)
		{
			//Day falls on a Sunday. Increment the day by one.
			testDate.setDate(testDate.getDate() + 1)
		}
	}
	return testDate
}

function calculateEaster(Y)
{
	//Copied from Gavin Gilmour on StackOverflow
	//https://stackoverflow.com/questions/1284314/easter-date-in-javascript
	let C = Math.floor(Y/100);
	let N = Y - 19*Math.floor(Y/19);
	let K = Math.floor((C - 17)/25);
	let I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
	I = I - 30*Math.floor((I/30));
	I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
	let J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
	J = J - 7*Math.floor(J/7);
	let L = I - J;
	let M = 3 + Math.floor((L + 40)/44);
	let D = L + 28 - 31*Math.floor(M/4);

	return createDate(Y, M, D)
}

function createDate(year, month, day)
{
	return new Date(year, month - 1, day)
}

function calculateRepeatDayOfMonth(year, month, weekday, repeat)
{
	//Remember that weekday MUST be treated an index from 1-7 when being input into this function!!
	//Also, the incoming month value is 1 greater than JS's date objects (Months are 0-11)
	if(repeat < 1) repeat = 1
	let testDate = createDate(year, month, 0)
	testDate.setDate(testDate.getDate() - (testDate.getDay() + 1) + weekday)
	//Check to see if we accidentally crossed back into the current month.
	if(testDate.getMonth() == month - 1) repeat--
	testDate.setDate(testDate.getDate() + 7 * repeat)
	return createDate(year, testDate.getMonth() + 1, testDate.getDate())
}

function calculateLastDayOfMonth(year, month, weekday)
{
	//Remember that weekday MUST be treated an index from 1-7 when being input into this function!!
	//Also, the incoming month value is 1 greater than JS's date objects (Months are 0-11)
	//In this instance, don't touch the month value during the declaration, as we are trying to get a month ahead
	let testDate = new Date(year, month, 1)
	testDate.setDate(testDate.getDate() - 1)
	return createDate(year, testDate.getMonth() + 1, testDate.getDate() - (testDate.getDay() + 1) + weekday)
}

function changeYear(change)
{
	let temp = window.location.hash
	let tempDate = new Date()
	let tempYear = tempDate.getFullYear()
	let tempMonth = tempDate.getMonth()
	if(temp.search('/') !== -1)
	{
		temp = temp.split('/')
		if(temp.length > 1) tempYear = parseFloat(temp[1]) + change
		if(temp.length > 2) tempMonth = parseFloat(temp[2])
	}
	else
	{
		tempYear = tempYear + change
	}
	tempYear = tempYear.toString()
	tempMonth = tempMonth.toString()
	window.location.hash = 'calednarMenu/' + tempYear + '/' + tempMonth
}

