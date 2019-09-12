function renderAppbay()
{
	clear_element(appbay)
	appbay.appendChild(createElement({elementType: 'div', className: 'appbayButtonContainer', children: [
		{ elementType: 'div', className: 'appbayButton appbayPeopleButton', id: 'people', onclick: null },
		{ elementType: 'div', className: 'appbayButton appbayMessgaesButton', id: 'messgaes', onclick: null },
		{ elementType: 'div', className: 'appbayButton appbayCalednarButton', id: 'calednar', onclick: null }
	]}))
	appbay.appendChild(createElement({elementType: 'div', className: 'appbayButton logoutButton', id: 'logout', onclick: logoutButton, text: 'Log Out' }))
}

function renderLoginPage()
{
	clearPage()
	clear_element(appbay)

	approot.style.backgroundColor = ""
	approot.style.backgroundImage = ""
	appsep.style.backgroundColor = "#666"

	addElementToBody({ elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv({ elementType: 'h2', className: 'menuHeading', text: 'Log In' })

	let loginForm = createElement({ elementType: 'form', className: 'loginForm', children: [
		{elementType: 'div', className: 'loginBox', children: [
			{elementType: 'div', className: 'loginGrid', children: [
				{elementType: 'span', className: 'inputLabel', text: 'Name:'},
				{elementType: 'input', type: 'text', className: 'loginInput', id: 'bujditUsername', placeholder: 'Username', size: '17', spellcheck: false, autocorrect: false},
				{elementType: 'span', className: 'inputLabel', text: 'Password:'},
				{elementType: 'input', type: 'password', className: 'loginInput', id: 'bujditPassword', placeholder: 'Password', size: '17'}
			]},
			{elementType: 'button', className: 'loginButton', onclick: loginButton, text: 'Log In'}
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
	clearPage()

	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.7, 0.75, 0.8)

	addElementToBody({ elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv({ elementType: 'h2', className: 'menuHeading', text: 'Main Menu' } )

	let buttonDiv = createElement({ elementType: 'div', id: 'mainButtonDiv', children: [
		{ elementType: 'div', className: 'menuButton bujditColor bujditsButton', text: 'Bujdits', onclick: ()=>{ window.location.hash = 'bujditsMenu' } },
		{ elementType: 'div', className: 'menuButton shnoppingListColor shnoppingListButton', text: 'Shnopping Lists', onclick: ()=>{ window.location.hash = 'shnoppingListMenu' } },
		{ elementType: 'div', className: 'menuButton payrolColor payrolButton', text: 'Payrol', onclick: ()=>{ window.location.hash = 'payrolsMenu' } },
		{ elementType: 'div', className: 'menuButton acountColor reportsButton', text: 'Reports', onclick: ()=>{ window.location.hash = 'reportsMenu' } },
		{ elementType: 'div', className: 'menuButton calednarColor calednarsButton', text: 'Calednar', onclick: ()=>{ window.location.hash = 'calednarMenu' } },
		{ elementType: 'div', className: 'menuButton frendsColor frendsButton', text: 'Frends', onclick: ()=>{ window.location.hash = 'frendsMenu' } },
		{ elementType: 'div', className: 'menuButton messgaesColor messgaesButton', text: 'Messgaes', onclick: ()=>{ window.location.hash = 'messgaesMenu' } },
		{ elementType: 'div', className: 'menuButton setingsColor setingsButton', text: 'Setings', onclick: ()=>{ window.location.hash = 'setingsMenu' } }
	]})
	rootDiv.appendChild(buttonDiv)
}

function renderBujditsPage()
{
	clearPage()

	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	bg_hue = flavorizePage(0.35, 0.425, 0.7)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Bujdits'} )

	sendCommand({cmd: 'bujdit_list', include_meta: true, user_meta: true }, renderRemainingBujditPage)
}

function renderRemainingBujditPage(data)
{
	let new_element = parseDataResponseList(data, 'bujdits', 'bujditColor bujditsButton', 'Create one new Bujdit for every bank account you plan to track!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton bujditColor', text: '+', onclick: renderNewBujditModal }))
}

function renderReportsPage()
{
	clearPage()

	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	bg_hue = flavorizePage(0.35, 0.425, 0.7)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Reports'} )

	renderRemainingReportsPage( 1 )		//Remove this command. Debugging purposes only
	//sendCommand({cmd: 'acount_list', include_meta: true, user_meta: true }, renderRemainingReportsPage)	//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderRemainingReportsPage(data)
{
	let new_element = parseDataResponseList(data, 'reports', 'acountColor acountButton', 'This page will run reports on your Bujdits to give you the big picture!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton acountColor', text: '+', onclick: renderNewAcountModal }))
}

function renderShnoppingListPage()
{
	clearPage()

	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.52, 0.56, .5)

	addElementToBody( { elementType: 'div', id: 'rootDiv' })
	addElementToRootDiv( {elementType: 'h2', className: 'menuHeading', text: 'Shnopping Lists'} )

	renderRemainingShnoppingListPage( 1 )		//Remove this command. Debugging purposes only
//	sendCommand({ cmd: "shnoppinglist_list", include_meta: true }, renderRemainingShnoppingListPage)		//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderRemainingShnoppingListPage(data)
{
	let new_element = parseDataResponseList(data, 'shnoppingListColor shnoppingLists', 'shnoppingListButton', 'A Shnopping List will track what you need to buy, schedule regular purchases, and estimate the total cost!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton shnoppingListColor', text: '+', onclick: renderNewShnoppingListModal }))
}

function renderCalednarPage()
{
	clearPage()

	//Keep the hue used for later
	// 0 = red, .33 = green, .66 = blue, 1 = red
	// The first two values are the min and max hue values, the third value is the saturation value
	bg_hue = flavorizePage(0.1, 0.15, .5)

//	addElementToBody( { elementType: 'h2', className: 'menuHeading', text: 'Calednar' } )

	let temp = window.location.hash
	let todaysDate = new Date()
	let year = parseFloat(todaysDate.getFullYear())
	let month = parseFloat(todaysDate.getMonth())

	if(temp.search('/') !== -1)
	{
		temp = temp.split('/')
		if(temp.length > 1 && temp[1] != "") year = parseFloat(temp[1])
		if(temp.length > 2 && temp[2] != "") month = parseFloat(temp[2])
		if(year < 2000) year = 2000
		if(month > 11) month = 11
		if(month < 0) month = 0
}


	renderRemainingCalednarPage( 1, year, month )		//Remove this command. Debugging purposes only
//	sendCommand({ cmd: "calednar_list", include_meta: true }, renderRemainingCalednarPage)		//	This is the command that is supposed to be used. It is not implemented yet.
}

function renderRemainingCalednarPage(data, year, month)
{
	addElementToBody( {elementType: 'div', className: 'calednarDateHeadings', children: [
		{ elementType: 'span', text: '⇦', className: 'calednarArrows', onclick: ()=>{ changeYear(-1) } },
		{ elementType: 'div', text: year, className: 'menuHeading calednarYear' },
		{ elementType: 'span', text: '⇨', className: 'calednarArrows', onclick: ()=>{ changeYear(1) } }
	]} )

	addElementToBody( {elementType: 'div', className: 'calednarDateHeadings', children: [
		{ elementType: 'span', text: '←', className: 'calednarArrows', onclick: ()=>{ changeMonth(-1) } },
		{ elementType: 'div', text: months[month], className: 'menuHeading calednarMonth' },
		{ elementType: 'span', text: '→', className: 'calednarArrows', onclick: ()=>{ changeMonth(1) } }
	]} )

	let new_element = createElement({ elementType: 'div', className: 'calednarGrid' })

	let currentDate = new Date()
	let workingDate = new Date(year, month)
	workingDate.setDate(workingDate.getDate() - workingDate.getDay())
	
	//Subtract the weekday from the date. That'll align us with Sunday.

	let workingYear = -1
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

		//This has to be THE VERY LAST THING added, or it will not display correctly
		if(workingMonth != workingDate.getMonth())
		{
			newDateBlock.children.push({ elementType: 'div', className: 'calednarOtherMonth' })
		}


		let textArray = []
		//Start this loop at 1 to skip the date number
		for(let i = 1; i < newDateBlock.children.length; i++)
		{
			textArray.push(newDateBlock.children[i].text)
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
	clearPage()

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
	let new_element = parseDataResponseList(data, 'payrols', 'payrolColor payrolButton', 'Keep track of your work hours and estimate your paycheck!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton payrolColor', text: '+', onclick: renderNewPayrolModal }))
}

function renderFrendsPage()
{
	clearPage()

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
	let new_element = parseDataResponseList(data, 'frends', 'frendsColor frendsButton', 'Add frends to share your Bujdits, Calednar, and Shnopping Lists and more!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton frendsColor', text: '+', onclick: renderNewFrendModal }))
}

function renderMessgaesPage()
{
	clearPage()

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
	let new_element = parseDataResponseList(data, 'messgaes', 'messgaesColor messgaesButton', 'Send messgaes to your frends!')
	rootDiv.appendChild(new_element)

	//Add 'New Item' button
	rootDiv.appendChild(createElement({ elementType: 'div', className: 'newItemButton messgaesColor', text: '+', onclick: renderNewMessgaesModal }))
}

function renderSetingsPage()
{
	clearPage()

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
