const Storage = require("./js/structures/Storage.js")
const Reminder = require("./js/structures/Reminder.js")
const storage = new Storage({ name: "data" })

$(document).ready(function() {
	load()
})

function load() {
	// main initialization
	setTimeout(() => {
		$(".loading").addClass("fadeOut")
		$(".loading").slideUp(750, function() {
			$(this).css("display", "none")
			$(this).remove()
		})
        
		$(".preloader-wrapper").addClass("fadeOutUp")
		$(".main-app").show(650)
		populateReminderSection()
		$(".grid-stack").on("dragstop", function(event, ui) {
			const grid = this
			const element = event.target
			saveGridPositions(grid, element)
		})
		$(".grid-stack").on("gsresizestop", function(event, ui) {
			const grid = this
			const element = event.target
			saveGridPositions(grid, element)
		})
	}, 1000)
}

document.addEventListener("DOMContentLoaded", function() {
	const elems = document.querySelectorAll(".fixed-action-btn")
	const instances = M.FloatingActionButton.init(elems, {
		direction: "left"
	})

	$(".main-app").hide()

	setTimeout(() => {
		$(".preloader-wrapper").show()
		$(".preloader-wrapper").addClass("fadeInUp")
	}, 600)

})

$("textarea.remindo-input").keypress(function(obj) {
	if (obj.keyCode == 13) {

	}
})

function dialog(message, severity, buttons = []) {
	let color
	let html = ""

	switch (severity) {
	case "critical":
		color = "red"
		severity = "Error"
		break
        
	case "warning":
		color = "orange"
		severity = "Warning"
		break
        
	case "info":
		color = "teal"
		severity = "Information"
		break

	default:
		color = "blue-grey"
		severity = "Dialog"
	}

	html += `<div class="row dialog">
    <div class="col">
    <div class="card z-depth-5 ${color} darken-1">
        <div class="card-content white-text">
        <span class="card-title"><b>${severity}</b></span>
        <p>${message}</p>
        </div>
        <div class="card-action">
        <a href="#" class="btn green darken-2" onclick="return true;">${buttons[0] || "Yes"}</a>
        <a href="#" class="btn red darken-1" onclick="return false;">${buttons[1] || "No"}</a>
        </div>
    </div>
    </div>
</div>`
	html += "</div>"

	$(".main-app-dialog").html("")
	$(".main-app-dialog").html(html)

	dialogBlurBackground("main-app-dialog")
}

function dialogBlurBackground(dialog = "current-selected-dialog") {
	if ($(`.${dialog}`).is(":hidden")) {
		$(`.${dialog}`).show()
		$(`.main-app>*:not(.${dialog})`).addClass("blur")
		$(`.${dialog}`).addClass("current-selected-dialog")
		$(`.${dialog}`).removeClass("zoomOut")
		$(`.${dialog}`).addClass("zoomIn")
	} else {
		$(`.main-app>*:not(.${dialog})`).removeClass("blur")
		$(`.${dialog}`).removeClass("zoomIn")
		$(`.${dialog}`).addClass("zoomOut")
		$(`.${dialog}`).removeClass("current-selected-dialog")
		setTimeout(() => { $(`.${dialog}`).hide() }, 600)
		return
	}
}

function actionButtonClicked(element) {
	reminderCreationMenu()
}

function reminderCreationMenu() {
	const body = document.getElementsByTagName("body")[0]
	const elem = document.querySelectorAll(".creation-menu")[0]

	$("#action-color-picker").colorpicker({
		component: ".colorpicker-btn"
	})

	dialogBlurBackground("creation-menu")
}

function create() {
	const reminders = storage.get("reminders")
	const item = new Reminder({
		title: $(".reminder-creation-title").val() || $("div.remindo-input.remindo-input-title").val(),
		description: $(".reminder-creation-description").val() || $("div.remindo-input.remindo-input-description").val(),
		position: {x: 0, y: 0, width: Math.floor(1 + 6 * Math.random()), height: Math.floor(1 + 5 * Math.random())},
		attachments: null,
		created: Date.now(),
		updated: Date.now(),
		color: $(".colorpicker-btn").css("backgroundColor"),
		font: null,
		completed: null,
		dueDate: null,
		tags: null,
		important: null,
		comments: null
	})
	reminders.push(item)
	return add("reminder", reminders)
}

function add(type, data) {
	// data is any object, like a reminder object
	storage.set(`${type}s`, data)
	populateReminderSection()
}

function archive(id) {
	// Implement an ID based system for reminders to remove reminders once created
	// Just pass in the reminder ID and remove/archive it 
	const reminders = storage.get("reminders")
	const archive = storage.get("archive")
	archive.push(reminders[id])
	storage.set("archive", archive)
	storage.set("reminders", reminders.filter(item => item.id != id)) 

	populateReminderSection()
}

function saveGridPositions(grid, element) {
	const reminders = storage.get("reminders")
	const node = $(element).data("_gridstack_node")
	if (!node) return
	if (!reminders[$(element).data("objectId")]) throw new Error("Reminder ID doesn't exist")
	reminders[$(element).data("objectId")].position = {
		x: node.x,
		y: node.y,
		width: node.width,
		height: node.height
	}
	storage.set("reminders", reminders)
	return false
}

function populateReminderSection() {
	const grid = $(".grid-stack").data("gridstack")
	grid.removeAll()

	for (const reminder of storage.get("reminders")) {
		const position = reminder.position
		let positions = position
		if (!positions) positions = {x: 0, y: 0, width: Math.floor(1 + 6 * Math.random()), height: Math.floor(1 + 5 * Math.random())}
		grid.addWidget($(`<div data-object-id=${reminder.id}>
        <div style="overflow: hidden; background-color: ${reminder.color || "#546e7a"} !important;" class="grid-stack-item-content card">
            <div class="wrapper" style="width: 100%; height: 100%; position: relative;">

                <div class="card-content white-text">
                    <span class="card-title">
                    <b>${reminder.title}</b>
                    </span>
                    <p>${reminder.description}</p>
                </div>

                <div class="hover-options-reminder animated" style="display: none;">
                    <center>
                        <a href="#" class="btn yellow darken-3" onclick="viewReminder(${reminder.id})">View</a>
                        <a href="#" class="btn cyan darken-3" onclick="editReminder(${reminder.id})">Edit</a>
                        <a href="#" class="btn red lighten-1" onclick="archive(${reminder.id})">Archive</a>
                    </center>
                </div>

            </div>
        </div>
        </div>`), positions.x, positions.y, positions.width, positions.height);

		$(".grid-stack-item").hover(
			function(){
				$(this).find(".hover-options-reminder").fadeIn(100);
				$(".grid-stack-item-content .wrapper").addClass("options-toggle");
			},  
			function(){
				$(this).find(".hover-options-reminder").fadeOut(100);
				$(".grid-stack-item-content .wrapper").removeClass("options-toggle");
			}
		)
		console.log(positions.x);
		// Math.floor(1 + 3 * Math.random())
	}
}

$(document).on("click", ".remindo-input", function() {
	if ($(".retracted-top-section").is(":visible") !== false) toggleTextbox();
});

$("body").not(".top-section").on("click", function() {
	if ($(".retracted-top-section").is(":visible") == false) toggleTextbox();
});

function toggleTextbox() {
	$(".expanded-top-section").toggle();
	$(".retracted-top-section").toggle();
}
