function renderAppbay()
{
	clear_element(appbay)
	appbay.appendChild(createElement({elementType: 'div', className: 'appbayButtonContainer', children: [
		{ elementType: 'div', className: 'appbayButton appbayBackButton', id: 'back', onclick: backButtonClick },
		{ elementType: 'div', className: 'appbayButton appbayMessgaesButton', id: 'messgaes', onclick: ()=>{ changeHash('messgaes') } },
		{ elementType: 'div', className: 'appbayButton setingsButton', id: 'setingsButton', onclick: null }
	]}))
	appbay.appendChild(createElement({elementType: 'div', className: 'appbayButton logoutButton', id: 'logout', onclick: logoutButton, text: 'Log Out' }))
}

function renderSplashPage()
{
	clear_element(appbay)
	clearPage()

	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.1, 0.15, 0)


	addElementToBody({ elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv({ elementType: 'h2', className: 'menuHeading', text: 'Spalsh Page!1' })
	addElementToRootDiv({ elementType: 'button', className: 'bigLoginButtons loginButton', onclick: ()=>{ loginModal() }, text: 'Log In' })
	addElementToRootDiv({ elementType: 'button', className: 'bigLoginButtons loginButton', text: 'Create Account' })
}

function renderLoginPage()
{
	clear_element(appbay)
	clearPage()

	approot.style.backgroundColor = ""
	approot.style.backgroundImage = ""
	appsep.style.backgroundColor = "#666"

	addElementToBody({ elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv({ elementType: 'h2', className: 'menuHeading', text: 'Log In' })

	let loginForm = createElement({ elementType: 'form', className: 'loginForm', children: [
		{ elementType: 'div', className: 'loginBox', children: [
			{ elementType: 'div', className: 'loginGrid', children: [
				{ elementType: 'span', className: 'inputLabel', text: 'Name:' },
				{ elementType: 'input', type: 'text', className: 'loginInput', id: 'bujditUsername', placeholder: 'Username', size: '17', spellcheck: false, autocorrect: false },
				{ elementType: 'span', className: 'inputLabel', text: 'Password:' },
				{ elementType: 'input', type: 'password', className: 'loginInput', id: 'bujditPassword', placeholder: 'Password', size: '17' }
			]},
			{ elementType: 'button', className: 'bigLoginButtons loginButton', onclick: loginButton, text: 'Log In' }
		]}
	]})

	loginForm.addEventListener('submit', (evt) => {
		evt.preventDefault()
	})

	rootDiv.appendChild(loginForm)
	bujditUsername.focus()
}

function renderMainMenu()
{
	setingsButton.onclick = renderMainMenuSetingsModal
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.7, 0.75, 0.8)

	addElementToBody({ elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv({ elementType: 'h2', className: 'menuHeading', text: 'Main Menu' } )

	let buttonDiv = createElement({ elementType: 'div', id: 'mainButtonDiv', children: [
		{ elementType: 'div', className: 'menuButton bujditColor bujditsButton', text: 'Bujdits', onclick: ()=>{ window.location.hash = 'bujditsMenu' } },
		{ elementType: 'div', className: 'menuButton shnoppingListColor shnoppingListButton', text: 'Shnopping Lists', onclick: ()=>{ window.location.hash = 'shnoppingListMenu' } },
		{ elementType: 'div', className: 'menuButton calednarColor calednarsButton', text: 'Calednar', onclick: ()=>{ window.location.hash = 'calednarMenu' } },
		{ elementType: 'div', className: 'menuButton payrolColor payrolButton', text: 'Payrol', onclick: ()=>{ window.location.hash = 'payrolsMenu' } },
		{ elementType: 'div', className: 'menuButton acountColor reprotsButton', text: 'Reprots', onclick: ()=>{ window.location.hash = 'reprotsMenu' } },
		{ elementType: 'div', className: 'menuButton frendsColor frendsButton', text: 'Frends', onclick: ()=>{ window.location.hash = 'frendsMenu' } },
//		{ elementType: 'div', className: 'menuButton messgaesColor messgaesButton', text: 'Messgaes', onclick: ()=>{ window.location.hash = 'messgaesMenu' } },
//		{ elementType: 'div', className: 'menuButton setingsColor setingsButton', text: 'Setings', onclick: ()=>{ window.location.hash = 'setingsMenu' } }
	]})
	rootDiv.appendChild(buttonDiv)
}

function renderBujditsPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	bg_hue = flavorizePage(0.35, 0.425, 0.7)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Bujdits'} )

	sendCommand({cmd: 'bujdit_list', include_meta: true, user_meta: true }, renderRemainingBujditPage)
}

function renderRemainingBujditPage(data)
{
	let new_element = parseDataResponseList(data, renderDeleteBujditModal, 'bujdits', 'bujditColor bujditsButton', 'Create one new Bujdit for every bank account you plan to track!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton bujditColor', text: '+', onclick: renderNewBujditModal }))
}

function renderReprotsPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	bg_hue = flavorizePage(0.35, 0.425, 0.7)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Reprots'} )

	renderRemainingReprotsPage( 1 )		//Remove this command. Debugging purposes only
	//sendCommand({cmd: 'acount_list', include_meta: true, user_meta: true }, renderRemainingReprotsPage)	//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderRemainingReprotsPage(data)
{
	let new_element = parseDataResponseList(data, null, 'reprots', 'acountColor acountButton', 'This page will run reprots on your Bujdits to give you the big picture!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton acountColor', text: '+', onclick: renderNewAcountModal }))
}

function renderShnoppingListPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.52, 0.56, .5)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Shnopping Lists'} )

	sendCommand({ cmd: "shnopping_list", include_meta: true }, renderRemainingShnoppingListPage)
}

function renderRemainingShnoppingListPage(data)
{
	let new_element = parseDataResponseList(data, addItemIDToHash, 'shnoppings', 'shnoppingListColor shnoppingListButton', 'A Shnopping List will track what you need to buy, schedule regular purchases, and estimate the total cost!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton shnoppingListColor', text: '+', onclick: renderNewShnoppingListModal }))
}

function getShnoppingListItems(listID)
{
	//This value is an array. The first value is the item to sort by, the second is the directiom to sort by. 1 is ascending, -1 is descending
	sortShnoppingListDirection = ['store', 1]

	addElementToBody( { elementType: 'div', id: 'rootDiv' })

	let topRow = { elementType: 'div', className: 'shnoppingListTopRow', children: [
			{ elementType: 'h2', className: 'textShadow', text: 'Store:' },
			{ elementType: 'select', id: 'storeSelection', className: '', onchange: ()=>{ renderShnoppingList(data) }, children: [
				{ elementType: 'option', value: 'Somewhere', text: 'Somewhere' },
				{ elementType: 'option', value: 'Nowhere', text: 'Nowhere' },
				{ elementType: 'option', value: 'Everywhere', text: 'Everywhere' },
				{ elementType: 'option', value: 'All', text: 'All', selected: 'selected' }
			] },
			{ elementType: 'div', className: 'addEntryButton shnoppingListColor', text: '+', onclick: ()=>{ console.log('CLICK') } },
			{ elementType: 'div', style: { flex: '1 1 auto' } },
			{ elementType: 'div', style: { flex: '1 1 auto' } },
			{ elementType: 'h2', className: 'textShadow', text: 'Option:' },
			{ elementType: 'select', id: 'optionSelection', className: '', children: [
				{ elementType: 'option', value: 'addData', text: 'Add Data' },
				{ elementType: 'option', value: 'addData', text: 'Add Data' },
				{ elementType: 'option', value: 'addData', text: 'Add Data' }
			] },
			{ elementType: 'div', className: 'addEntryButton shnoppingListColor', text: '+', onclick: ()=>{ console.log('CLICK') } },
			{ elementType: 'div', style: { flex: '1 1 auto' } }
		] }

	//DEBUG ONLY, REMOVE WHEN DATABASE COMMAND IS COPMLETE
	data = { listName: 'TEST - NEED ACTUAL LIST NAME HERE', items: [
		{ name: 'Purpleges', store: 'Somewhere', quantity: 50, status: 0 },
		{ name: 'Greenges', store: 'Somewhere', quantity: 5, status: 1 },
		{ name: 'Clippits', store: 'Somewhere', quantity: 50, status: 2 },
		{ name: 'Monkeys', store: 'Somewhere', quantity: 50, status: 3 },
		{ name: 'Uurpleges', store: 'Nowhere', quantity: 3, status: 0 },
		{ name: 'Dreenges', store: 'Somewhere', quantity: 2, status: 1 },
		{ name: 'Mippits', store: 'Nowhere', quantity: 1, status: 2 },
		{ name: 'Clonkeys', store: 'Everywhere', quantity: 10, status: 3 },
		{ name: 'Furpleges', store: 'Somewhere', quantity: 50, status: 0 },
		{ name: 'Kreenges', store: 'Somewhere', quantity: 5, status: 1 },
		{ name: 'Blippits', store: 'Nowhere', quantity: 50, status: 2 },
		{ name: 'Qlonkeys', store: 'Everywhere', quantity: 50, status: 3 }
		]}
	//DEBUG ONLY, REMOVE WHEN DATABASE COMMAND IS COPMLETE


	addElementToRootDiv( { elementType: 'h2', text: data.listName } )
	addElementToRootDiv(topRow)
	addElementToRootDiv( { elementType: 'div', id: 'listDiv' })

	sortShnoppingListDirection[0] = ''
	sortShnoppingListByStore()

//	sendCommand({ cmd: "shnopping_list" }, renderShnoppingList)
}

function renderShnoppingList()
{
console.log(sortShnoppingListDirection)

	clear_element(listDiv)

	//	addElementToRootDiv({ elementType: 'div', className: 'newItemButton shnoppingListColor', text: '+', onclick: addShnoppingListItemModal })

	//This array dictates the order everything will be displayed in
	shnoppingListItemParameters = ['Store', 'Name', 'Quantity', 'Status']
	let new_list = { elementType: 'div', className: 'shnoppingListFrame', children: [] }

	for(let j = 0; j < shnoppingListItemParameters.length; j++)
	{
		let new_item = { elementType: 'div', className: 'shnoppingListItem shnoppingListHeader', children: [ ] }
		let test = shnoppingListItemParameters[j].toLowerCase()
		if(test == 'store') new_item.onclick = ()=>{ sortShnoppingListByStore() }
		if(test == 'name') new_item.onclick = ()=>{ sortShnoppingListByName() }
		if(test == 'quantity') new_item.onclick = ()=>{ sortShnoppingListByQuantity() }
		if(test == 'price') new_item.onclick = ()=>{ sortShnoppingListByPrice() }

		let headerText = { elementType: 'span', className: 'shnoppingListHeaderText', text: shnoppingListItemParameters[j] }
		if(shnoppingListItemParameters[j].toLowerCase() == sortShnoppingListDirection[0])
		{
			if(sortShnoppingListDirection[1] == 1)
			{
				headerText.text = headerText.text + ' ↑'
			}
			else
			{
				headerText.text = headerText.text + ' ↓'
			}
		}
		new_item.children.push(headerText)
		new_list.children.push(new_item)
		shnoppingListItemParameters[j] = shnoppingListItemParameters[j].toLowerCase()
	}

	for(let i = 0; i < data.items.length; i++)
	{
		//Status 0 = item on list
		//Status 1 = item in cart
		//Status 2 = item purchased
		//Status 3 = Unused

		//If the filter doesn't match, don't show!
		if(storeSelection.value.toLowerCase() != 'all' && storeSelection.value.toLowerCase() != data.items[i].store.toLowerCase()) continue

		let newItemClassName = 'shnoppingListItemOnList'
		if(data.items[i].status == 1) newItemClassName = 'shnoppingListItemInCart'
		if(data.items[i].status == 2) newItemClassName = 'shnoppingListItemPurchased'
		if(data.items[i].status == 3) newItemClassName = ''	//Placeholder
		for(let j = 0; j < shnoppingListItemParameters.length; j++)
		{
			let new_item = { elementType: 'div', className: 'shnoppingListItem ' + newItemClassName + ' shnoppingListEntry' + [shnoppingListItemParameters[j]], text: data.items[i][shnoppingListItemParameters[j]] }
			if(shnoppingListItemParameters[j] == 'name')
			{
				if(data.items[i].variety)
				{
					new_item.text = new_item.text + ' - ' + data.items[i][variety]
				}
				if(data.items[i].description)
				{
					new_item.text = new_item.text + ' - ' + data.items[i][description]
				}
			}
			new_list.children.push(new_item)
		}

	}
	listDiv.appendChild(createElement(new_list))
}

function renderCalednarPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.1, 0.15, .5)

//	addElementToBody( { elementType: 'h2', className: 'menuHeading', text: 'Calednar' } )

	let temp = getURLDate()
	let year = temp[0]
	let month = temp[1]

	renderRemainingCalednarPage( 1, year, month )		//Remove this command. Debugging purposes only
//	sendCommand({ cmd: "calednar_list", include_meta: true }, renderRemainingCalednarPage)		//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderMonthInput(inputMonth)
{
	let new_element = { elementType: 'select', id: 'monthInput', onchange: ()=>{ forceCalednarMonth(document.getElementById('monthInput').value) }, className: 'menuHeading calednarMonth calednarInput', children: []}

	for(let i = 0; i < months.length; i++)
	{
		if(i == inputMonth)
		{
			new_element.children.push({ elementType: 'option', selected: 'selected', text: months[i], value: i })
		}
		else
		{
			new_element.children.push({ elementType: 'option', text: months[i], value: i })
		}
	}
	return new_element
}

function renderRemainingCalednarPage(data, year, month)
{
	// Keeping these for later: ← →
	addElementToBody( {elementType: 'div', className: 'calednarDateHeadings', children: [
		{ elementType: 'span', text: '⇩', className: 'calednarArrows', onclick: ()=>{ setURLDate(-12) } },
		{ elementType: 'input', type: 'number', size: 4, value: year, id: 'calednarYearField', size: 6, onchange: ()=>{ forceCalednarYear(document.getElementById('calednarYearField').value) }, className: 'menuHeading calednarYear calednarInput' },
		{ elementType: 'span', text: '⇧', className: 'calednarArrows', onclick: ()=>{ setURLDate(12) } },
		{ elementType: 'div', className: 'calednarArrowSpacer' },
		{ elementType: 'span', text: '⇦', className: 'calednarArrows', onclick: ()=>{ setURLDate(-1) } },
		renderMonthInput(month),
		{ elementType: 'span', text: '⇨', className: 'calednarArrows', onclick: ()=>{ setURLDate(1) } }
	]} )

	let new_element = createElement({ elementType: 'div', className: 'calednarGrid' })

	let currentDate = new Date()
	let workingDate = new Date(year, month)
	workingDate.setDate(workingDate.getDate() - workingDate.getDay())
	
	//Subtract the weekday from the date. That'll align us with Sunday.

	let workingYear = year
	let workingMonth = month
	let events = calculateEvents(workingDate.getFullYear())

	//Render the 7 day labels
	for(let j = 0; j < 7; j++)
	{
		new_element.appendChild(createElement({ elementType: 'div', text: weekdays[j], className: 'calednarWeekdayLabel' }))
	}

	//Render 42 cells to fill with calendar dates. 6 rows of 7 cells
	for(let i = 0; i < 42; i++)
	{
		let newDateBlock = { elementType: 'div', className: 'calednarDayNumbers', className: 'calednarDay', children: [
			{ elementType: 'span', className: 'calednarDayNumbers', text: workingDate.getDate() }
			]}

		if(workingYear != workingDate.getFullYear())
		{
			//Year changed! Recalculate events
			workingYear = workingDate.getFullYear()
			events = calculateEvents(workingYear)
		}

		//Now, check for events and format accordingly
		for(let eventType in events)
		{
			for(let eventInfo in events[eventType].dates)
			{
				if(compareDate(workingDate, events[eventType].dates[eventInfo].date))
				{
					//Event match. Color accordingly
					newDateBlock.children.push({ elementType: 'div', style: { backgroundColor: events[eventType].color }, className: 'calednarCellText', text: events[eventType].dates[eventInfo].name })
				}
			}
		}	

		if(compareDate(workingDate, currentDate))
		{
			//Must be the current day. Add another classname to the goods.
			newDateBlock.className = newDateBlock.className + ' calednarCurrentDay'
		}

		if(workingMonth != workingDate.getMonth())
		{
			newDateBlock.className = newDateBlock.className + ' calednarOtherMonth'
		}

		let textArray = []
		//Start this loop at 1 to skip the date number
		for(let i = 1; i < newDateBlock.children.length; i++)
		{
			textArray.push({ text: newDateBlock.children[i].text, style: { backgroundColor: newDateBlock.children[i].style.backgroundColor } })
		}
		let functionDate = new Date(workingDate.getFullYear(), workingDate.getMonth(), workingDate.getDate())
		newDateBlock.onclick = ()=> { createCalednarModal(functionDate, textArray) }

		new_element.appendChild(createElement(newDateBlock))
		workingDate.setDate(workingDate.getDate() + 1)
	}

	approot.appendChild(new_element)
}

function compareDate(inputDate1, inputDate2)
{
	if(inputDate1.getFullYear() == inputDate2.getFullYear() && inputDate1.getMonth() == inputDate2.getMonth() && inputDate1.getDate() == inputDate2.getDate()) return true
	return false
}

function renderPayrolPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red.
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.95, 1, .5)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Payrol'} )

	renderRemainingPayrolPage( 1 )		//Remove this command. Debugging purposes only
//	sendCommand({ cmd: "payrol_list", include_meta: true }, renderRemainingPayrolPage)		//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderRemainingPayrolPage(data)
{
	let new_element = parseDataResponseList(data, renderDeletePayrolModal, 'payrols', 'payrolColor payrolButton', 'Keep track of your work hours and estimate your paycheck!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton payrolColor', text: '+', onclick: renderNewPayrolModal }))
}

function renderFrendsPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.7, 0.8, .4)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Frends'} )

	renderRemainingFrendsPage( 1 )		//Remove this command. Debugging purposes only
//	sendCommand({ cmd: "frends_list", include_meta: true }, renderRemainingFrendsPage)		//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderRemainingFrendsPage(data)
{
	let new_element = parseDataResponseList(data, renderDeleteFrendModal, 'frends', 'frendsColor frendsButton', 'Add frends to share your Bujdits, Calednar, Shnopping Lists and more!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton frendsColor', text: '+', onclick: renderNewFrendModal }))
}

function renderMessgaesPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.6, 0.7, 0)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Messgaes'} )

	renderRemainingMessgaesPage( 1 )		//Remove this command. Debugging purposes only
//	sendCommand({ cmd: "messgaes_list", include_meta: true }, renderRemainingMessgaesPage)		//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderRemainingMessgaesPage(data)
{
	let new_element = parseDataResponseList(data, null, 'messgaes', 'messgaesColor messgaesButton', 'Send messgaes to your frends!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton messgaesColor', text: '+', onclick: renderNewMessgaesModal }))
}

function renderSetingsPage()
{
	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	bg_hue = flavorizePage(0.5, 0.6, 0)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Setings'} )

//	Need to get a list of settings here to render
//	sendCommand({ cmd: "bujdit_list", include_meta: true }, renderRemainingBujditPage)
}

function renderRemainingSetingsPage(data)
{
	
}
