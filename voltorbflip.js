let grid_hidden,new_row;
let amount_of_voltorbs,temp_multiplier_adder;
let row_number,box_number; // row first then column/box
let number_of_rows = 5,number_of_boxes = 5;
let line_useless,line_without_bomb,line_multiplier
let game_over = false,game_win;
let seconds = 0, minutes = 0, timer_stop = false;
let box_selected; // for adding notes
let game_score = 0,total_score = 0;
let amount_of_loss = 0;
let original_multiplier_adder = 1,max_score; // This value is the amount of 2 (3s = 2 for adder), it changes up/down if the max_score doesn't respect data values
let current_level = 1;
let data_values = { // Taken from the actual game, that I saw via a wiki page iirc
	coin_1_min: 24,
	coin_1_max: 48,
	coin_2_min: 54,
	coin_2_max: 96,
	coin_3_min: 108,
	coin_3_max: 192,
	coin_4_min: 216,
	coin_4_max: 324,
	coin_5_min: 384,
	coin_5_max: 576,
	coin_6_min: 648,
	coin_6_max: 972,
	coin_7_min: 1152,
	coin_7_max: 1728,
	coin_8_min: 2187,
	coin_8_max: 3456,
};
let menu_popup,popup_text,card_back,confirm_option;
let logging_key;



function loading() {
	size(number_of_rows,number_of_boxes)
	grid_reset()
	updateTimer()
	document.addEventListener("contextmenu", right_click)
	document.addEventListener("click", left_click)
	document.addEventListener('keydown', logKey);
}

function size(new_value_one,new_value_two) {
	if (screen.width>screen.height) {
		number_of_rows = new_value_one
		number_of_boxes = new_value_two
	} else {
		number_of_rows = new_value_two
		number_of_boxes = new_value_one
	}
	//document.getElementsByClassName('selected_size')[0].innerText = "Selected size: " + number_of_rows + "x" + number_of_boxes
}

//function difficulty(multiplier,text_to_display) {
//	bomb_multipler = multiplier
//	document.getElementsByClassName('selected_difficulty')[0].innerText = "Selected difficulty: " + text_to_display
//}

function replay_quit() {
	if (game_over) {
		grid_reset()
	} else {
		menu_popup = document.getElementsByClassName("menu_popup")[0]
		popup_text = document.getElementsByClassName("popup_text")[0]
		menu_popup.style.display = "flex"
		document.getElementsByClassName("popup_title")[0].innerText = "Quitting"
		popup_text.innerHTML = "This will stop the ongoing game and add your current score to your total score. Are you sure?"
		document.getElementsByClassName("button_yes")[0].innerText = "Yes"
		document.getElementsByClassName("button_no")[0].innerText = "Go back"
		confirm_option = true
	}
}

function grid_reset() {
	//console.log("Loading grid...")
	//console.log(line_useless,line_without_bomb,line_multiplier)
	number_of_rows = 5 // Number(document.getElementById("rows_wanted").value)
	number_of_boxes = 5 //Number(document.getElementById("columns_wanted").value)
	document.getElementsByClassName("level")[0].innerText = "Level " + current_level
	game_over = false;
	amount_of_voltorbs = 5 + current_level; // made up formula, based of actual data
	temp_multiplier_adder = original_multiplier_adder
	seconds = 0
	minutes = 0
	timer_stop = true;
	grid_html = document.getElementsByClassName("grid")[0]
	for (var i = grid_html.getElementsByClassName("rows").length - 1; i >= 0; i--) {
		remove_row = grid_html.getElementsByClassName("rows")[i]
		remove_row.remove()
	}
	grid_hidden = new Array(number_of_rows)
	for (var i = 0; i < number_of_rows; i++) {
		grid_hidden[i] = new Array(number_of_boxes)

		new_row = document.createElement('tr');
		new_row.className = "rows"
		new_row.Name = i
		for (var j = 0; j < number_of_rows; j++) { // boxes
			let new_box = document.createElement('td');
			new_row.appendChild(new_box);
			new_box.className = "box"
			new_box.Name = j
			// weird stuff cuz rotation weird
			let new_card = document.createElement('div');
			new_card.className = "card_front"
			new_box.appendChild(new_card);
			let card_back = document.createElement('div');
			card_back.addEventListener("click", play)
			card_back.addEventListener("mouseover", function(e) {
				box_selected = e.target.parentElement
				hovering(true)
			} )
			card_back.addEventListener("mouseout", hovering(false))
			card_back.className = "card_back"
			new_box.appendChild(card_back);
			//let new_background = document.createElement('div'); // needed for bg color before flip
			//new_background.className = "box_background"
			//new_box.appendChild(new_background);
		}
		 // row end with row info
		row_info = document.createElement('th');
		row_info.className = "row_info"
		new_row.appendChild(row_info);
		grid_html.appendChild(new_row);
	}
	// last row with column info
	new_row = document.createElement('tr'); 
	new_row.className = "rows"
	for (var i = 0; i < number_of_boxes; i++) {
		row_info = document.createElement('th');
		row_info.className = "row_info"
		new_row.appendChild(row_info);
	}
	grid_html.appendChild(new_row);
	// last box with buttons
	button_box = document.createElement('div') 
	button_box.className = "button_box"
	replay_quit_button = document.createElement('button')
	replay_quit_button.innerText = "Quit game"
	replay_quit_button.addEventListener("click", replay_quit)
	button_box.appendChild(replay_quit_button);
	new_row.appendChild(button_box);
	grid_generation()
}

function grid_generation() {
	// bomb generation
	timer_stop = false
	placing_flag = false;

	for (var i = 0; i < grid_hidden.length; i++) {
		for (var j = 0; j < grid_hidden[i].length; j++) {
			grid_hidden[i][j] = 1
		}
	}
	while (amount_of_voltorbs>0) {
		row_number = Math.floor(Math.random()*number_of_rows)
		box_number = Math.floor(Math.random()*number_of_boxes)
		while (grid_hidden[row_number][box_number]=="bomb") {
			row_number = Math.floor(Math.random()*number_of_rows)
			box_number = Math.floor(Math.random()*number_of_boxes)
		}
		grid_hidden[row_number][box_number] = "bomb"
		amount_of_voltorbs--
	}
	while (temp_multiplier_adder>0) {
		row_number = Math.floor(Math.random()*number_of_rows)
		box_number = Math.floor(Math.random()*number_of_boxes)
		while ((grid_hidden[row_number][box_number]>=3)||(grid_hidden[row_number][box_number]=="bomb")) {
			row_number = Math.floor(Math.random()*number_of_rows)
			box_number = Math.floor(Math.random()*number_of_boxes)
		}
		grid_hidden[row_number][box_number]++
		temp_multiplier_adder--
	}
	for (var i = 0; i < grid_hidden.length; i++) {
		for (var j = 0; j < grid_hidden[i].length; j++) {
			//grid_html.getElementsByClassName("rows")[i].getElementsByClassName("box")[j].getElementsByClassName('card_front')[0].innerText = grid_hidden[i][j] // doesn't really matter
		}
	}
	grid_check() // checking if the grid respects difficulty and score restrictions
}

function grid_check() {
	max_score = 1
	for (var i = 0; i < grid_hidden.length; i++) {
		for (var j = 0; j < grid_hidden[i].length; j++) {
			if (grid_hidden[i][j]!="bomb") {
				max_score *= grid_hidden[i][j]
			}
		}
	}
	min_value = Object.entries(data_values)[(current_level-1)*2][1] // take all entries of data, take the row corresponding to level and take the value
	max_value = Object.entries(data_values)[(current_level-1)*2+1][1]
	if (max_score<min_value) {
		original_multiplier_adder++
		return grid_reset() // restarting
	} else if (max_score>max_value) {
		original_multiplier_adder--
		return grid_reset() // restarting
	} else {
		line_useless = 0; 
		line_without_bomb = 0;
		line_multiplier = 0;
		for (var i = 0; i < grid_hidden.length; i++) {
			var is_line_useless = true
			var line_contains_bomb = false
			for (var j = 0; j < grid_hidden[i].length; j++) {
				if (grid_hidden[i][j]>1) {
					is_line_useless = false // green + red = 5
					line_multiplier += grid_hidden[i][j]-1
				}
				if (grid_hidden[i][j]=="bomb") {
					line_contains_bomb = true // self explanatory
				}
			}
			if (is_line_useless) {
				line_useless++
			}
			if (!line_contains_bomb) {
				line_without_bomb++	
				if (line_multiplier>3) { // if useless row has 9+ as green number, redo cuz too easy
					return grid_reset() // restarting
				}
			}
		}
		for (var i = 0; i < number_of_boxes; i++) {
			var is_line_useless = true
			var line_contains_bomb = false
			for (var j = 0; j < number_of_rows; j++) {
				if (grid_hidden[j][i]>1) { // reverse i j cause going column:row instead of row:column
					is_line_useless = false
					line_multiplier += grid_hidden[j][i]-1
				}
				if (grid_hidden[j][i]=="bomb") {
					line_contains_bomb = true
				}
			}
			if (is_line_useless) {
				line_useless++
			}
			if (!line_contains_bomb) {
				line_without_bomb++	
				if (line_multiplier>3) { // if useless row has 9+ as green number, redo cuz too easy
					return grid_reset() // restarting
				}
			}
		}
		if (line_without_bomb>2) { // if useless row has 8 as green number, redo cuz too easy
			return grid_reset() // restarting
		}
		if (line_useless>3) { // not too many cuz else too easy
			return grid_reset()
		}
		if ((line_useless==0)&&(current_level==1)) { // let's be nice for lvl 1
			return grid_reset()
		}
		if (line_without_bomb>2) { // not too many cuz else too easy
			return grid_reset()
		}
		if ((line_without_bomb==0)&&(current_level==1)) { // let's be nice for lvl 1
			return grid_reset()
		}	
		console.log(min_value + " < " + max_score + " < " + max_value)
		row_info_add() // moving on
	}
}

function row_info_add() {
	for (var i = 0; i < document.getElementsByClassName('row_info').length; i++) {
		// upper part, multiplier info
		row_info_FirstPart = document.createElement('div') 
		row_info_FirstPart.classList.add("row_info_div","row_info_multiplier")
		// lower part, bomb info
		row_info_SecondPart = document.createElement('div') 
		row_info_SecondPart.classList.add("row_info_div")
		// voltorb icon&info for lower part
		voltorb_info = document.createElement('div')
		voltorb_info.className = "row_info_data" 
		voltorb_icon = document.createElement('div') 
		voltorb_icon.className = "row_info_img" 
		// appending all
		document.getElementsByClassName('row_info')[i].appendChild(row_info_FirstPart)
		document.getElementsByClassName('row_info')[i].appendChild(row_info_SecondPart)
		row_info_SecondPart.appendChild(voltorb_icon)
		row_info_SecondPart.appendChild(voltorb_info)
	}
	for (var i = 0; i < number_of_rows; i++) { // rows first
		var bomb_count = 0
		var multiplier_count = 0
		for (var j = 0; j < number_of_boxes; j++) {
			if (grid_hidden[i][j]=="bomb") {
				bomb_count++
			} else {
				multiplier_count += grid_hidden[i][j]
			}
		}
		if (multiplier_count<10) {
			multiplier_count = "0"+multiplier_count 
		}
		document.getElementsByClassName("row_info_data")[i].innerText = bomb_count
		document.getElementsByClassName("row_info_multiplier")[i].innerText = multiplier_count
	}
	for (var i = 0; i < number_of_boxes; i++) { // columns second
		var bomb_count = 0
		var multiplier_count = 0
		for (var j = 0; j < number_of_rows; j++) {
			if (grid_hidden[j][i]=="bomb") { // reverse i j because checking vertically
				bomb_count++
			} else {
				multiplier_count += grid_hidden[j][i]
			}
		}
		if (multiplier_count<10) {
			multiplier_count = "0"+multiplier_count 
		}
		document.getElementsByClassName("row_info_data")[i+number_of_rows].innerText = bomb_count
		document.getElementsByClassName("row_info_multiplier")[i+number_of_rows].innerText = multiplier_count
	}
}

function edit_note(note_number) {
	new_note = document.createElement('div')
	if (box_selected.getElementsByClassName(note_number.toString()).length==0) {
		new_note.innerText = note_number
		new_note.name = note_number
		new_note.className = "box_note"
		new_note.classList.add(note_number) // for checking if already exists cause GetEltByName broke
		//console.log(box_selected)
		card_back = box_selected.getElementsByClassName('card_back')[0]
		card_back.appendChild(new_note)
		if (note_number==0) {
			new_note.style.bottom = "35%"
		}
		if (note_number==1) {
			new_note.style.bottom = "35%"
			new_note.style.left = "80%"
		}
		if (note_number==2) {
			new_note.style.top = "35%"
		}
		if (note_number==3) {
			new_note.style.left = "80%"
			new_note.style.top = "35%"
		}
	} else {
		box_selected.getElementsByClassName(note_number.toString())[0].remove()
	}
}

function updateTimer() {
	if (!timer_stop) {
		seconds ++
	}
   
     setTimeout(updateTimer, 1000)
     if (seconds==60) {
     	seconds=0
     	minutes+=1
     }
     if ((minutes==59)&&(seconds==59)) {
     	stop_timer = true
     }
     if (seconds<10) {
    	document.getElementsByClassName('timer')[0].innerText = "Timer: " + minutes + ":0" + seconds
     } else {
    	document.getElementsByClassName('timer')[0].innerText = "Timer: " + minutes + ":" + seconds
    }
     if ((seconds==0)&&(minutes==0)) {
    	document.getElementsByClassName('timer')[0].innerText = "Game didn't start yet, click on a box to play."
     }
}

function yes() {
	if (confirm_option) {
		game_over = true
		confirm_option = false
		end_game("quit")
		return
	}
	menu_popup = document.getElementsByClassName("menu_popup")[0]
	popup_text = document.getElementsByClassName("popup_text")[0]
	menu_popup.style.display = "none"
	grid_reset()
}

function no() {
	if (confirm_option) {
		menu_popup.style.display = "none"
		confirm_option = false
		return
	}
	menu_popup = document.getElementsByClassName("menu_popup")[0]
	popup_text = document.getElementsByClassName("popup_text")[0]
	menu_popup.style.display = "none"
	replay_quit_button.innerText = "Start level " + current_level
}

function hovering(in_or_out) {
	//console.log("you are in/out")
	logging_key = in_or_out
}

function logKey(move) {
	if (logging_key) {
		if ((move.key=="0")||(move.key=="1")||(move.key=="2")||(move.key=="3")) {
			edit_note(move.key) 
		}
	}
}

function right_click(e) {
	box_selected = e.target.parentElement
	if (box_selected.nodeName=="TD") {
		e.preventDefault()
		context_menu = document.getElementsByClassName('context_menu')[0]
		context_menu.style.top = event.clientY + "px";
		context_menu.style.left = event.clientX + "px";
		context_menu.classList.add("active")
	}
}

function left_click(e) {
	document.getElementsByClassName('playing_audio')[0].volume = 0.4
	document.getElementsByClassName('playing_audio')[0].loop = true
	if (music_choice!="None") {
		document.getElementsByClassName('playing_audio')[0].play()
	}
	if (!e.target.classList.contains("context_option")) {
		context_menu = document.getElementsByClassName('context_menu')[0]
		context_menu.classList.remove("active")
	}
	temp_box = e.target
	box_number = temp_box.parentElement.Name
	row_number = temp_box.parentElement.parentElement.Name
	if ((e.target.classList.contains("card_back"))&&(!game_over)) {
		temp_box = e.target
		temp_box.parentElement.getElementsByClassName('card_front')[0].classList.add("flipped_card")
		temp_box.parentElement.getElementsByClassName('card_back')[0].classList.add("flipped_card_back")
	}
}

function play(e) {
	if (game_over) {
		return
	}
	box_selected = e.target
	box_number = box_selected.parentElement.Name
	row_number = box_selected.parentElement.parentElement.Name
	//console.log(grid_hidden[row_number][box_number])
	if (grid_hidden[row_number][box_number]=="bomb") {
		grid_html.getElementsByClassName("rows")[row_number].getElementsByClassName("box")[box_number].getElementsByClassName('card_front')[0].style.backgroundImage = "url('Images/Voltorb_bomb.gif')"
		setTimeout( function() {
			document.getElementsByClassName('playing_audio')[1].currentTime = 0
			document.getElementsByClassName('playing_audio')[1].play()
		},200)
		e.target.parentElement.getElementsByClassName('card_front')[0].classList.add("flipped_card")
		e.target.parentElement.getElementsByClassName('card_back')[0].classList.add("flipped_card_back")
		game_score = 0
		game_over = true
		window.setTimeout(function() {
			end_game("loss")
		},2000)
	}
	if (grid_hidden[row_number][box_number]>0) {
		setTimeout( function() {
			document.getElementsByClassName('playing_audio')[1].currentTime = 0
			document.getElementsByClassName('playing_audio')[2].play()
		},200)
		reveal_box(row_number,box_number)
	}
}


function reveal_box(temp_row,temp_box) {
	grid_html.getElementsByClassName("rows")[temp_row].getElementsByClassName("box")[temp_box].getElementsByClassName('card_front')[0].classList.add("flipped_card")
	grid_html.getElementsByClassName("rows")[temp_row].getElementsByClassName("box")[temp_box].getElementsByClassName('card_back')[0].classList.add("flipped_card_back")
	box_selected = grid_html.getElementsByClassName("rows")[temp_row].getElementsByClassName("box")[temp_box].getElementsByClassName('card_front')[0]
	box_selected.innerText = grid_hidden[temp_row][temp_box]
	if (box_selected.innerText=="1") {
		box_selected.style.color = "#4287f5"
	}
	if (box_selected.innerText=="2") {
		box_selected.style.color = "#42f55a"
	}
	if (box_selected.innerText=="3") {
		box_selected.style.color = "#fa4e1e"
	}
	if (game_score==0) {
		game_score = grid_hidden[temp_row][temp_box]
	} else {
		game_score *= grid_hidden[temp_row][temp_box]
	}
	document.getElementsByClassName("score")[0].innerText = "Current game score: " + game_score
	verify_win()
}

function verify_win() {
	win_check = true
	for (var row_number = 0; row_number < grid_hidden.length; row_number++) {
		for (var box_number = 0; box_number < grid_hidden.length; box_number++) {
			box_selected = grid_html.getElementsByClassName("rows")[row_number].getElementsByClassName("box")[box_number].getElementsByClassName('card_front')[0]
			if ((box_selected.innerText!=grid_hidden[row_number][box_number])&&(grid_hidden[row_number][box_number]>1)) {
				win_check = false
			}
		}
	}
	if (win_check) {
		game_over = true
		window.setTimeout(function() {
			end_game("win")
		},500)
	}
}

function end_game(win_or_loss) {
	for (var row_number = 0; row_number < grid_hidden.length; row_number++) {
		for (var box_number = 0; box_number < grid_hidden.length; box_number++) {
			box_selected = grid_html.getElementsByClassName("rows")[row_number].getElementsByClassName("box")[box_number].getElementsByClassName('card_front')[0]
			box_selected.classList.add('flipped_card')
			box_selected_back = grid_html.getElementsByClassName("rows")[row_number].getElementsByClassName("box")[box_number].getElementsByClassName('card_back')[0]
			box_selected_back.classList.add('flipped_card_back')
			setTimeout( function() {
				document.getElementsByClassName('playing_audio')[2].play()
			},200)
			if (grid_hidden[row_number][box_number]=="bomb") {
				box_selected.style.backgroundImage = "url('Images/Voltorb_bomb.gif')"
			} else {
				box_selected.innerText = grid_hidden[row_number][box_number]
				if (box_selected.innerText=="1") {
					box_selected.style.color = "#4287f5"
				}
				if (box_selected.innerText=="2") {
					box_selected.style.color = "#42f55a"
				}
				if (box_selected.innerText=="3") {
					box_selected.style.color = "#fa4e1e"
				}
			}
		}
	}
	timer_stop = true
	if (win_or_loss=="quit") {
		popup_text.innerHTML = "You quit to keep your current coins, which got added to your total balance."
		game_win = false
		sound_index = 5
	}
	if (win_or_loss=="loss") {
		popup_text.innerHTML = "You lost so you didn't gain any coin. Do you want to restart?"
		game_win = false
		sound_index = 4
	}
	if (win_or_loss=="win") {
		if (current_level<8) {
			current_level++
			popup_text.innerHTML = "You won! Your current coins were added to your balance and you are now at level " + current_level + "!"
		} else {
			popup_text.innerHTML = "You won! Your current coins were added to your balance."
		}
		sound_index = 3
		game_win = true
	}
	var level_loss = false
	if (!game_win) {
		amount_of_loss++
		while ((5 - current_level - amount_of_loss < 0)&&(current_level>1)) {
			current_level--
			level_loss = true
		}
		if (level_loss) {
			popup_text.innerHTML += "<br>You went down to level " + current_level + "."
		}
	}
	total_score += game_score
	game_score = 0
	document.getElementsByClassName("score")[0].innerText = "Current game score: " + game_score
	document.getElementsByClassName("score")[1].innerText = "Total score: " + total_score
	document.getElementsByClassName("button_yes")[0].innerText = "Start level " + current_level
	document.getElementsByClassName("popup_title")[0].innerText = "Game over!"
	setTimeout(function() {
		document.getElementsByClassName('playing_audio')[sound_index].play()
		menu_popup.style.display = "flex"
	},2000)
}

function edit_music() {
	music_choice = document.getElementById('music_choice').value.toString()
	console.log(music_choice)
	//document.getElementById('background_music').source = music_choice + ".mp3" -> Not working for an unkown reason
	if (music_choice=="None") {
		document.getElementsByClassName('playing_audio')[0].pause()
	} else {
		document.getElementsByClassName('playing_audio')[0].play()
		document.getElementsByClassName('playing_audio')[0].setAttribute('src',"Sounds/" + music_choice + ".mp3")
	}
}
