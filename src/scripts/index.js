'use strict'

var mainLoop = require("main-loop")
var h = require("virtual-dom/h")
var page = require("page");

function render(state) {
  var names = ["Fred", "Dorothy", "Eero"]

  return h("div", [
    h("div", [
      h("span", "hello "),
      h("span.name", state.name)
    ]),
    h("ul", names.map(renderName))
  ])

  function renderName(name) {
    return h("li", [
      h("a", {
        href: "/" + name
      }, name)
    ])
  }
}

// Set up initial state
var initState = {
  name: "Steve"
}

// Set up a loop
// FIXME: this should only happen in browser,
// otherwise just render to a string.
var loop = mainLoop(initState, render, {
  create: require("virtual-dom/create-element"),
  diff: require("virtual-dom/diff"),
  patch: require("virtual-dom/patch")
})
document.body.appendChild(loop.target)

// Set up routes
page("/:name", function(ctx) {
  console.log(ctx)
  loop.update({
    name: ctx.params.name
  })
})

// Initialize
page()
