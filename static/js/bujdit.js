//Declarations

//The web address of the API
api				=	'https://bujdit.dogi.us/api'

//The page title in the browser
title			=	'Bujdit - Better than a budget'

//Number of milliseconds for an error message to stay on-screen. Messages will also go away if clicked/tapped
errorTimeout		=	5000
monkeyAngerTimeout	=	45000		//45 seconds
angryLevel			=	5
furiousLevel		=	8
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
	101: 'Invalid username/Password!',

	// BUJDIT
	200: 'required field missing!',
	201: 'Bujdit not found or insufficient access!',
	202: 'Name required!',
    
	// SHNOPPING
	300: 'Required field missing!',
	301: 'Shnopping not found or insufficient access!',
	302: 'Name required!',
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

function localSet(key, value)
{
	return localStorage.setItem(key, JSON.stringify(value))
}

function localGet(key)
{
	let temp = null
	try
	{
		temp = JSON.parse(localStorage.getItem(key))
	}
	catch(err)
	{
		localStorage.setItem(key, null)
	}
	return temp
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
	
	let token = localGet('session')
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
				indicators.pulse(2, 1000)
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

function changeHash(inputValue)
{
	window.location.hash = inputValue
}

function addItemIDToHash(inputID, inputName)
{
	let temp = window.location.hash
	while(temp[temp.length - 1] == "/")
	{
		temp = temp.substr(0, temp.length - 1)
	}
	window.location.hash = temp + '/' + inputID
}

function logoutButton()
{
	localStorage.removeItem('session')
	sendCommand( {cmd: "user_logout"}, doNothing)
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
		localSet('session', inputData.token)
		selectPageToRender()
	}
	else
	{
		displayError(inputData.code)
	}
}

function selectPageToRender()
{
	closeModal()
	clearPage()
	renderAppbay()

	setingsButton.onclick = ()=>{ console.log('FIXME') }
	let temp = window.location.hash
	temp = temp.split('/')

	if(!localGet('session'))
{
		if(temp == '' || temp == '#')
		{
			//Not logged in, and nowhere to be. Splash page.
			renderSplashPage()
			return
		}
		else
		{
			//Not logged in, but we're supposed to be somewhere. Force login page.
			renderLoginPage()
			return
		}
	}

	switch(temp[0])
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
		case '#messgaes':
			renderMessgaesPage()
			break
		case '#setingsMenu':
			renderSetingsPage()
			break
		case '#bujditsMenu':
			if(temp[1]) 
			{
				//We're supposed to be inside a list.
				getBujditDetails(temp[1])
			}
			else
			{
				renderBujditsPage()
			}
			break
		case '#reprotsMenu':
			renderReprotsPage()
			break
		case '#shnoppingListMenu':
			if(temp[1]) 
			{
				//We're supposed to be inside a list.
				getShnoppingListItems(temp[1])
			}
			else
			{
				renderShnoppingListPage()
			}
			break
		case '#mainMenu':
			renderMainMenu()
			break
		case '#login':
		case '#':
		case '':
		default:
			//We don't have a place to be. Force the main menu.
			window.location.hash = 'mainMenu'
	}
}

function doNothing()
{
	//This is used to allow a callback to do nothing, without causing any errors
	return
}

function backButtonClick()
{
	let temp = window.location.hash.split('/')
	if(temp.length == 0 || temp[0] == '' || temp[0] == '#')
	{
		return
	}
	temp.pop()
	temp = temp.join('/')
	if(temp == '#' || temp == '') temp = 'mainMenu'
	window.location.hash = temp
}

function setFocus(focusID)
{
	if(focusID != '' && document.getElementById(focusID))
	{
		document.getElementById(focusID).focus()
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
	let command = ''
	switch(itemName)
	{
		case 'bujdits':
			command = 'bujdit_user_meta_set'
			break
		case 'shnoppings':
			command = 'shnopping_user_meta_set'
			break
	}
	sendCommand( { cmd: command, id: itemID, field: 'starred', meta: newStatus }, processStarStatusChange)
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

function parseDataResponseList(data, clickFunction, itemName, classNameForElements, nothingFoundMessage)
{
	let buttonDiv = createElement( {elementType: 'div', id: 'mainButtonDiv' })
	if(data !== 1 && data && data[itemName] && data[itemName].length > 0)		//REMOVE THE DATA !== 1 COMPARISON WHEN THE REST OF THE MENU OPTIONS HAVE BEEN ADDED
	{
		data = sortData(data, itemName)
		for(let i = 0; i < data[itemName].length; i++)
		{
			//These declarations are necessary so the stuff below doesn't freak out
			if(!data[itemName][i].meta) data[itemName][i].meta = {}
			if(!data[itemName][i].meta.userColor) data[itemName][i].meta.userColor = ''

			if(data[itemName][i].user_meta && data[itemName][i].user_meta.starred == true)
			{
				buttonDiv.appendChild(createElement({ elementType: 'div', style: {backgroundColor: data[itemName][i].meta.userColor}, className: 'menuButton ' + classNameForElements, onclick: ()=>{ clickFunction(data[itemName][i].id, data[itemName][i].name) }, bujdit_id: data[itemName][i].id, children: [
					{ elementType: 'div', className: 'star highlighted', text: '★', onclick: (evt)=>{ evt.stopPropagation(); changeStarredStatus(itemName, data[itemName][i].id, false)} },
					{ elementType: 'span', className: 'ellipsis', text: data[itemName][i].name }
				]}))
			}
			else
			{
				buttonDiv.appendChild(createElement({ elementType: 'div', style: {backgroundColor: data[itemName][i].meta.userColor}, className: 'menuButton ' + classNameForElements, onclick: ()=>{ clickFunction(data[itemName][i].id, data[itemName][i].name) }, bujdit_id: data[itemName][i].id, children: [
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

function sortShnoppingListByStore()
{
	toggleShnoppingListSort('store')
	data.items = sortShnoppingList(data.items, 'quantity', 1)
	data.items = sortShnoppingList(data.items, 'price', 1)
	data.items = sortShnoppingList(data.items, 'name', 1)
	data.items = sortShnoppingList(data.items, 'store', sortShnoppingListDirection[1])
	data.items = sortShnoppingList(data.items, 'status', 1)

	renderShnoppingList()
}

function sortShnoppingListByName()
{
	toggleShnoppingListSort('name')

	data.items = sortShnoppingList(data.items, 'quantity', 1)
	data.items = sortShnoppingList(data.items, 'price', 1)
	data.items = sortShnoppingList(data.items, 'store', 1)
	data.items = sortShnoppingList(data.items, 'name', sortShnoppingListDirection[1])
	data.items = sortShnoppingList(data.items, 'status', 1)

	renderShnoppingList()
}

function sortShnoppingListByQuantity()
{
	toggleShnoppingListSort('quantity')

	data.items = sortShnoppingList(data.items, 'price', 1)
	data.items = sortShnoppingList(data.items, 'name', 1)
	data.items = sortShnoppingList(data.items, 'store', 1)
	data.items = sortShnoppingList(data.items, 'quantity', sortShnoppingListDirection[1])
	data.items = sortShnoppingList(data.items, 'status', 1)

	renderShnoppingList()

}

function sortShnoppingListByPrice()
{
	toggleShnoppingListSort('price')

	data.items = sortShnoppingList(data.items, 'quantity', 1)
	data.items = sortShnoppingList(data.items, 'price', sortShnoppingListDirection[1])
	data.items = sortShnoppingList(data.items, 'name', 1)
	data.items = sortShnoppingList(data.items, 'store', 1)
	data.items = sortShnoppingList(data.items, 'status', 1)

	renderShnoppingList()
}

function toggleShnoppingListSort(itemName)
{
	itemName = itemName.toLowerCase()
console.log(itemName + ' Sort')
	if(sortShnoppingListDirection[0] == itemName)
	{
		if(sortShnoppingListDirection[1] == 1)
		{
			sortShnoppingListDirection[1] = -1
		}
		else
		{
			sortShnoppingListDirection[1] = 1
		}
	}
	else
	{
		sortShnoppingListDirection[0] = itemName
		sortShnoppingListDirection[1] = 1
	}
}

function sortShnoppingList(data, parameter, direction)
{
	//Direction 1 means sort ascending, direction -1 means descending
	data.sort((a, b)=>{
		if(a[parameter] == undefined || b[parameter] == undefined) return 0
		let aCheck = null
		let bCheck = null
		if(isNaN(a[parameter]))
		{
			aCheck = a[parameter].toLowerCase()
		}
		else
		{
			aCheck = parseFloat(a[parameter])
		}
		if(isNaN(b[parameter]))
		{
			bCheck = b[parameter].toLowerCase()
		}
		else
		{
			bCheck = parseFloat(b[parameter])
		}
		if(aCheck > bCheck)
		{
			if(direction == 1)
			{
				return 1
			}
			else
			{
				return -1
			}
		}
		if(aCheck < bCheck)
		{
			if(direction == 1)
			{
				return -1
			}
			else
			{
				return 1
			}
		}
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

	if(localGet('monkeyAngerLevel'))
	{
		//Light up the furious light if need be, and trigger the monkey's anger reduction time
		decreaseMonkeyAnger()
	}
	else
	{
		//Must not have any of these goodies in local storage. Declare them.
		localSet('monkeyAngerLevel', 0)			//Start the monkey with no anger
		localSet('moneyMonkeyFurious', false)	//Monkey is not furious with the user
	}

	//Check to see if the session is valid and render the appropriate page
	sendCommands([], [checkTokenValid])
})

function heartbeat()
{
	if (localGet('session'))
	{
		sendCommand({}, doNothing)
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
	localSet('monkeyAngerLevel', localGet('monkeyAngerLevel') + 1)
	if(localGet('monkeyAngerLevel') > 11) localSet('monkeyAngerLevel', 11)
	errorDiv.monkeyAngerTimer = setTimeout(decreaseMonkeyAnger, monkeyAngerTimeout)
	if(localGet('monkeyAngerLevel') > furiousLevel)
	{
		localSet('moneyMonkeyFurious', true)
		indicators.flash(4, 200)
	}
}

function decreaseMonkeyAnger()
{
	clearTimeout(errorDiv.monkeyAngerTimer)
	localSet('monkeyAngerLevel', localGet('monkeyAngerLevel') - 1)
	if(localGet('monkeyAngerLevel') < 0) localSet('monkeyAngerLevel', 0)
	if(localGet('monkeyAngerLevel') > furiousLevel)
	{
		displayMessage('Grrrrrrr...')
	}
	if(localGet('monkeyAngerLevel') == angryLevel && localGet('moneyMonkeyFurious') == true)
	{
		displayMessage('Okay, I\'m better now.')
		localSet('moneyMonkeyFurious', false)
	}
	if(localGet('moneyMonkeyFurious') == true)
	{
		indicators.flash(4, 200)
	}
	else
	{
		indicators.clear(4)
	}
	if(localGet('monkeyAngerLevel') > 0) errorDiv.monkeyAngerTimer = setTimeout(decreaseMonkeyAnger, monkeyAngerTimeout)
}

function displayError(error)
{
	unlockPage()
	indicators.pulse(0, 3000)
	increaseMonkeyAnger()
	displayMessage(error)
}

function displayMessage(message)
{
	clearTimeout(errorDiv.errorTimer)	

	//Make sure a monkey anger message doesn't interfere with any messages
	clearTimeout(errorDiv.monkeyAngerTimer)
	if(localGet('monkeyAngerLevel') > 0) errorDiv.monkeyAngerTimer = setTimeout(decreaseMonkeyAnger, monkeyAngerTimeout)

	clear_element(errorDiv)
	errorDiv.style.display = ''
	if(localGet('monkeyAngerLevel') > furiousLevel)
	{
		//Furious monkey
		errorDiv.appendChild(createElement( {elementType: 'div', className: 'errorMonkey furiousMonkey', text: '' } ))
	}
	else
	{
		if(localGet('monkeyAngerLevel') > angryLevel)
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

function deleteShnoppingList(inputValue)
{
	if(inputValue)
	{
		sendCommand({ cmd: 'shnopping_delete', id: inputValue }, checkModalFormSuccess)
	}
}

function deletePayrol(inputValue)
{
	if(inputValue)
	{
//		sendCommand({ cmd: 'shnopping_delete', id: inputValue }, checkModalFormSuccess)
	}
}

function deleteFrend(inputValue)
{
	if(inputValue)
	{
//		sendCommand({ cmd: 'shnopping_delete', id: inputValue }, checkModalFormSuccess)
	}
}

function deleteMessgae(inputValue)
{
	if(inputValue)
	{
//		sendCommand({ cmd: 'shnopping_delete', id: inputValue }, checkModalFormSuccess)
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
	if(localGet('session')) window.location.hash = ''
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

function forceCalednarYear(inputYear)
{
	let temp = getURLDate()
	let tempDate = new Date()
	tempDate.setMonth(temp[1])

	let year = inputYear.toString()
	let month = tempDate.getMonth().toString()

	if(checkAgainstTodaysDate(year, month))
	{
		window.location.hash = 'calednarMenu'
		return
	}
	//Since JS runs on a different month index than people, this value needs incremented
	month++

	window.location.hash = 'calednarMenu/' + year + ';' + month
}

function forceCalednarMonth(inputMonth)
{
	let temp = getURLDate()
	let tempDate = new Date()
	tempDate.setFullYear(temp[0])

	let year = tempDate.getFullYear().toString()
	let month = inputMonth.toString()

	if(checkAgainstTodaysDate(year, month))
	{
		window.location.hash = 'calednarMenu'
		return
	}
	//Since JS runs on a different month index than people, this value needs incremented
	month++

	window.location.hash = 'calednarMenu/' + year + ';' + month
}

function getURLDate()
{
	let temp = window.location.hash
	let tempDate = new Date()
	if(temp.search('/') !== -1)
	{
		temp = temp.split('/')
		if(temp[1].length > 0)
		{
			temp = temp[1].split(';')
			if(temp.length > 0) tempDate.setFullYear(parseFloat(temp[0]))
			//Since JS runs on a different month index than people, this value needs decremented
			if(temp.length > 1) tempDate.setMonth(parseFloat(temp[1]) - 1)
		}
	}
	let tempYear = tempDate.getFullYear()
	let tempMonth = tempDate.getMonth()

	return [tempYear, tempMonth]
}

function setURLDate(monthChange)
{
	let temp = getURLDate()
	let tempDate = new Date()
	tempDate.setFullYear(temp[0])
	tempDate.setMonth(temp[1] + monthChange)
	
	let year = tempDate.getFullYear()
	let month = tempDate.getMonth()

	if(checkAgainstTodaysDate(year, month))
	{
		window.location.hash = 'calednarMenu'
		return
	}
	//Since JS runs on a different month index than people, this value needs incremented
	month++

	year = year.toString()
	month = month.toString()

	window.location.hash = 'calednarMenu/' + year + ';' + month
}

function checkAgainstTodaysDate(year, month)
{
	let currentDate = new Date()
	if(currentDate.getFullYear() == year && currentDate.getMonth() == month) return true
	return false
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
	events.federalHolidays = { color: '#B44', description: 'Federal Holiday', dates: [] }
	events.holidays = { color: '#4B4', description: 'Holiday', dates: [] }
	events.importantDays = { color: '#77F', description: '', dates: [] }


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
	events.federalHolidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 11, 5, 4), name: "Thanksgiving Day" })
	events.federalHolidays.dates.push({ date: calculateSetDay(inputYear, 12, 25), name: "Christmas Day" })


	//NON-FEDERAL HOLIDAYS
	events.holidays.dates.push({ date: calculateSetDay(inputYear, 2, 14), name: "Valentine's Day" })
	events.holidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 5, 1, 2), name: "Mother's Day" })
	events.holidays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 6, 1, 3), name: "Father's Day" })
	events.holidays.dates.push({ date: calculateSetDay(inputYear, 10, 31), name: "Halloween" })
	events.holidays.dates.push({ date: calculateSetDay(inputYear, 9, 11), name: "Patriot Day" })


	//IMPORTANT DAYS (Non-holidays)
	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 3, 6, 1), name: "Employee Appreciation Day" })
	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 3, 1, 2), name: "Daylight Savings Time Begins" })
	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 11, 1, 1), name: "Daylight Savings Time Ends" })

	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 11, 5, 4, 1), name: "Black Friday" })

	events.importantDays.dates.push({ date: calculateRepeatDayOfMonth(inputYear, 11, 5, 4, 4), name: "Cyber Monday" })

	
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

function calculateEaster(Y, additional = 0)
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
	let testDate = createDate(Y, M, D)
	testDate.setDate(testDate.getDate() + additional)
	return testDate
}

function createDate(year, month, day)
{
	return new Date(year, month - 1, day)
}

function calculateRepeatDayOfMonth(year, month, weekday, repeat, additional = 0)
{
	//Remember that weekday MUST be treated an index from 1-7 when being input into this function!!
	//Also, the incoming month value is 1 greater than JS's date objects (Months are 0-11)
	if(repeat < 1) repeat = 1
	let testDate = createDate(year, month, 0)
	testDate.setDate(testDate.getDate() - (testDate.getDay() + 1) + weekday)
	//Check to see if we accidentally crossed back into the current month.
	if(testDate.getMonth() == month - 1) repeat--
	testDate.setDate(testDate.getDate() + 7 * repeat)
	testDate = createDate(year, testDate.getMonth() + 1, testDate.getDate())
	testDate.setDate(testDate.getDate() + additional)
	return testDate
}

function calculateLastDayOfMonth(year, month, weekday, additional = 0)
{
	//Remember that weekday MUST be treated an index from 1-7 when being input into this function!!
	//Also, the incoming month value is 1 greater than JS's date objects (Months are 0-11)
	//In this instance, don't touch the month value during the declaration, as we are trying to get a month ahead
	let testDate = new Date(year, month, 1)
	testDate.setDate(testDate.getDate() - 1)
	testDate = createDate(year, testDate.getMonth() + 1, testDate.getDate() - (testDate.getDay() + 1) + weekday)
	if(testDate.getMonth() == month)
	{
		testDate.setDate(testDate.getDate() - 7)
	}
	testDate.setDate(testDate.getDate() + additional)
return testDate
}

