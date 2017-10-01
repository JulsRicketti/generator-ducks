const <%= actionName %> = '<%= duckName %>/<%= actionName %>'

const defaultState = {
  <%= defaultStateName %>: <% if (addQuotesToStateValue) {%>'<% } %><%= defaultStateValue %><% if (addQuotesToStateValue) {%>'<% } %>
}

export default function reducer (state = defaultState, action = {}) {
  switch (action.type) {
    case <%= actionName %>:
      return Object.assign({}, state, { <%= defaultStateName %>: action.<%= defaultStateName %> })
    default:
      return state
  }
}

export function <%= actionCreatorName%> (value) {
  return { type: <%= actionName %>, value }
}