import { Server } from "../api_client/apiClient";
import { notify } from "reapop";

export function fetchPeople() {
  return function (dispatch) {
    dispatch({ type: "FETCH_PEOPLE" });
    Server.get("persons/?page_size=1000")
      .then((response) => {
        var mappedPeopleDropdownOptions = response.data.results.map(function (
          person
        ) {
          return {
            key: person.id,
            value: person.name,
            text: person.name,
            face_url: person.face_url,
            face_count: person.face_count,
            face_photo_url: person.face_photo_url,
          };
        });
        dispatch({
          type: "FETCH_PEOPLE_FULFILLED",
          payload: mappedPeopleDropdownOptions,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_PEOPLE_REJECTED", payload: err });
      });
  };
}

export function addPerson(person_name) {
  return function (dispatch) {
    dispatch({ type: "ADD_PERSON" });
    Server.post("persons/", { name: person_name })
      .then((response) => {
        const personDropdownOption = {
          text: response.data.name,
          value: response.data.name,
          key: response.data.id,
        };
        dispatch({
          type: "ADD_PERSON_FULFILLED",
          payload: personDropdownOption,
        });
      })
      .catch((err) => {
        dispatch({ type: "ADD_PERSON_REJECTED", payload: err });
      });
  };
}

export function renamePerson(personId, personName, newPersonName) {
  return function (dispatch) {
    dispatch({ type: "RENAME_PERSON" });
    Server.patch(`persons/${personId}/`, {
      newPersonName: newPersonName,
    })
      .then((response) => {
        dispatch({ type: "RENAME_PERSON_FULFILLED", payload: personId });
        dispatch(fetchPeople());
        dispatch(
          notify({
            message: `${personName} was successfully renamed to ${newPersonName}.`,
            title: "Rename person",
            status: "success",
            dismissible: true,
            dismissAfter: 3000,
            position: "br",
          })
        );
      })
      .catch((err) => {
        dispatch({ type: "RENAME_PERSON_REJECTED", payload: err });
      });
  };
}

export function deletePerson(person_id) {
  return function (dispatch) {
    dispatch({ type: "DELETE_PERSON" });
    Server.delete(`persons/${person_id}/`)
      .then((response) => {
        dispatch(fetchPeople());
        dispatch({ type: "DELETE_PERSON_FULFILLED" });
      })
      .catch((err) => {
        dispatch({ type: "DELETE_PERSON_REJECTED", payload: err });
      });
  };
}

export function addPersonAndSetLabelToFace(person_name, face_id) {
  return function (dispatch) {
    dispatch({ type: "ADD_PERSON_AND_SET_FACE_LABEL" });
    // Make post request to /persons/
    Server.post("persons/", { name: person_name })
      .then((response1) => {
        // Make patch request to update person label
        var endpoint = `faces/${face_id}/`;
        Server.patch(endpoint, { person: { name: person_name } })
          .then((response2) => {
            var personDropdownOption2 = {
              text: response2.data.person.name,
              value: response2.data.person.name,
              key: response2.data.person.id,
            };
            dispatch({
              type: "ADD_PERSON_AND_SET_FACE_LABEL_FULFILLED",
              payload: personDropdownOption2,
            });
          })
          .catch((err2) => {
            dispatch({
              type: "ADD_PERSON_AND_SET_FACE_LABEL_REJECTED",
              payload: err2,
            });
          });
      })
      .catch((err1) => {
        dispatch({
          type: "ADD_PERSON_AND_SET_FACE_LABEL_REJECTED",
          payload: err1,
        });
      });
  };
}

export function fetchSocialGraph() {
  return function (dispatch) {
    dispatch({ type: "FETCH_SOCIAL_GRAPH" });
    Server.get("socialgraph")
      .then((response) => {
        dispatch({
          type: "FETCH_SOCIAL_GRAPH_FULFILLED",
          payload: response.data,
        });
      })
      .catch((err) => {
        dispatch({ type: "FETCH_SOCIAL_GRAPH_REJECTED", payload: err });
      });
  };
}
