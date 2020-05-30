import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  Button,
  ButtonGroup,
  ListGroup,
  ListGroupItem,
  Form,
  FormInput,
  Progress,
  CardBody,
  Row,
  Col,
  CardFooter,
} from "shards-react";

import {
  firestore,
  firebase_auth,
  firebase,
  firebaseConfig,
} from "../../firebase-config";
import { addDocError, sucessoGeral } from "../../utils/messages_strings";
import { Multiselect } from "multiselect-react-dropdown";
import ListGroupReact from "react-bootstrap/ListGroup";
import {
  defaultAvatar,
  languageCode,
  parentsParameters,
  studentsParameters,
  showToast,
  toastTypes,
} from "../../utils/general_utils";

class CasoDetailOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      title: props.title,
      data: props.data,
      username: props.username,
      arquivado: props.arquivado,
      membros: props.membros,
      memberNames: "",
      editingTitle: false,
      titleToAdd: "",
      buttonSave: "Gravar",
      buttonsEditDisabled: false,
      updatingMembers: false,
      membersToAdd: [],
      options: [],
      membersComplete: [],
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.editTitle = this.editTitle.bind(this);
    this.handleTitleToAddChange = this.handleTitleToAddChange.bind(this);
    this.cancelEditTitle = this.cancelEditTitle.bind(this);
    this.finalizeEditTitle = this.finalizeEditTitle.bind(this);
    this.startMembersUpdate = this.startMembersUpdate.bind(this);
    this.cancelUpdatingMembers = this.cancelUpdatingMembers.bind(this);
    this.finalizeUpdatingMembers = this.finalizeUpdatingMembers.bind(this);
    this.onSelectMembro = this.onSelectMembro.bind(this);
    this.onRemoveMembro = this.onRemoveMembro.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount(updating) {
    this._isMounted = true;

    var memberNames = "";

    var membros = this.state.membros;

    if (membros != null) {
      for (var i = 0; i < membros.length; i++) {
        var membro = membros[i];
        if (i == 0) {
          memberNames += membro.nome;
        } else {
          memberNames += ", " + membro.nome;
        }
      }
    }

    this.setState({ memberNames: memberNames });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  editTitle() {
    const { title } = this.state;
    this.setState({ editingTitle: true, titleToAdd: title });
  }

  handleTitleToAddChange(e) {
    this.setState({ titleToAdd: e.target.value });
  }

  cancelEditTitle() {
    this.setState({ editingTitle: false, titleToAdd: "" });
  }

  finalizeEditTitle() {
    const { titleToAdd, id } = this.state;
    const this_ = this;

    this.setState({ buttonSave: "A gravar...", buttonsEditDisabled: true });

    const project_id = firebaseConfig.projectId;

    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/updateTituloCaso?" +
      "id=" +
      id +
      "&titulo=" +
      encodeURIComponent(titleToAdd);

    const request = async () => {
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          if (data && data._writeTime) {
            showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);
            var newTitle = titleToAdd;
            this_.setState(
              {
                buttonSave: "Gravar",
                buttonsEditDisabled: false,
                title: newTitle,
                titleToAdd: "",
                editingTitle: false,
              },
              () => this_.props.updateTitle(newTitle)
            );
          } else {
            showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
            this_.setState({
              buttonSave: "Gravar",
              buttonsEditDisabled: false,
            });
          }
        })
        .catch(function (error) {
          console.log(error);
          showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
          this_.setState({ buttonSave: "Gravar", buttonsEditDisabled: false });
        });
    };

    request();
  }

  startMembersUpdate() {
    const { membros, options } = this.state;

    var currentMembers = [];

    for (var i = 0; i < membros.length; i++) {
      var membro = membros[i];
      currentMembers.push(membro["id"]);
    }

    if (options.length == 0) {
      const parentsCollection = firestore.collection("parents");

      parentsCollection.get().then((querySnapshot) => {
        var membersArray = [];
        var membersArrayComplete = [];
        var options = [];
        var optionsSelected = [];

        var index = 0;
        querySnapshot.forEach((doc) => {
          if (doc.data()["Nome"] != undefined && doc.data()["Nome"] != null) {
            if (
              doc.data()["Validated"] != undefined &&
              doc.data()["Validated"] != null &&
              doc.data()["Validated"].toString() != "false"
            ) {
              membersArrayComplete.push({
                nome: doc.data()["Nome"],
                id: doc.data()["Email"],
                photo: doc.data()["photo"],
              });

              if (currentMembers.includes(doc.data()["Email"])) {
                optionsSelected.push({ id: index, name: doc.data()["Nome"] });
              }
              options.push({ id: index, name: doc.data()["Nome"] });

              index += 1;
            }
          }
        });
        if (options.length != 0) {
          this.setState({
            updatingMembers: true,
            membersComplete: membersArrayComplete,
            options: options,
            membersToAdd: optionsSelected,
          });
        } else {
          //No users to add
        }
      });
    } else {
      var optionsSelected = [];
      var alreadyPut = [];
      for (var i = 0; i < membros.length; i++) {
        var membro = membros[i];

        if (!alreadyPut.includes(membro["id"])) {
          optionsSelected.push({ id: i, name: membro["nome"] });
          alreadyPut.push(membro["id"]);
        }
      }

      this.setState({
        updatingMembers: true,
        membersToAdd: optionsSelected,
      });
    }
  }

  cancelUpdatingMembers() {
    this.setState({ updatingMembers: false, membersToAdd: [] });
  }

  finalizeUpdatingMembers() {
    const { membersToAdd, id, membersComplete, options } = this.state;
    const this_ = this;
    var listaMembros = [];
    const project_id = firebaseConfig.projectId;

    for (var i = 0; i < membersToAdd.length; i++) {
      listaMembros.push(membersComplete[membersToAdd[i].id]);
    }

    if (listaMembros.length != 0) {
      this_.setState({ buttonsEditDisabled: true, buttonSave: "A gravar..." });

      let uri =
        "https://us-central1-" +
        project_id +
        ".cloudfunctions.net/api/updateMembrosCaso?" +
        "id=" +
        id +
        "&membros=" +
        encodeURIComponent(JSON.stringify(listaMembros));

      const request = async () => {
        await fetch(uri)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function (data) {
            if (data != null && data._writeTime) {
              //Sucesso

              var memberNames = "";
              for (var i = 0; i < listaMembros.length; i++) {
                var membro = listaMembros[i];
                if (i == 0) {
                  memberNames += membro.nome;
                } else {
                  memberNames += ", " + membro.nome;
                }
              }

              this_.setState({
                membersToAdd: [],
                buttonSave: "Gravar",
                buttonsEditDisabled: false,
                updatingMembers: false,
                membros: listaMembros,
                memberNames: memberNames,
              });
              this_.props.updateMembers(listaMembros);
            } else {
              //Erro
              this_.setState({
                buttonsEditDisabled: false,
              });
            }
          })
          .catch(function (error) {
            console.log(error);
            this_.setState({
              buttonsEditDisabled: false,
            });
          });
      };

      request();
    } else {
    }
  }

  onSelectMembro(selectedList, selectedItem) {
    var array = this.state.membersToAdd;
    array.push(selectedItem);
    this.setState({ membersToAdd: array });
  }

  onRemoveMembro(selectedList, removedItem) {
    const { membersToAdd } = this.state;
    var array = membersToAdd;

    var index = array.indexOf(removedItem);
    if (index !== -1) {
      array.splice(index, 1);
    }

    this.setState({ membersToAdd: array });
  }

  /*********************************** HANDLERS ***********************************/
  render() {
    return (
      <Card
        style={{ width: "100%", "margin-right": "60px" }}
        small
        className="mb-4 pt-3"
      >
        <CardHeader className="border-bottom text-center">
          <h4 style={{ float: "left" }} className="mb-0">
            {this.state.title}
          </h4>
        </CardHeader>

        <CardBody>
          <span className="text-muted d-block mb-2">
            <span style={{ "font-weight": "bold", color: "black" }}>
              Criador:{" "}
            </span>
            {this.state.username}
          </span>
          <span className="text-muted d-block mb-2">
            <span style={{ "font-weight": "bold", color: "black" }}>
              Data:{" "}
            </span>
            {this.state.data}
          </span>
          <span className="text-muted d-block mb-2">
            <span style={{ "font-weight": "bold", color: "black" }}>
              Arquivado:{" "}
            </span>
            {this.state.arquivado == true ? "Sim" : "Não"}
          </span>
          <span className="text-muted d-block mb-2">
            <span style={{ "font-weight": "bold", color: "black" }}>
              Membros:{" "}
            </span>
            {this.state.memberNames}
          </span>
        </CardBody>

        <CardFooter>
          {this.state.editingTitle ? (
            <Form className="add-new-post">
              <FormInput
                size="lg"
                className="mb-3"
                placeholder="Título"
                type="text"
                onChange={this.handleTitleToAddChange}
                value={this.state.titleToAdd}
              />
            </Form>
          ) : this.state.updatingMembers ? (
            <Form className="add-new-post">
              <label htmlFor="membros">Membros</label>
              <Multiselect
                options={this.state.options} // Options to display in the dropdown
                onSelect={this.onSelectMembro} // Function will trigger on select event
                onRemove={this.onRemoveMembro}
                selectedValues={this.state.membersToAdd}
                displayValue="name" // Property name to display in the dropdown options
                //showCheckbox={true}
              />
            </Form>
          ) : (
            <ButtonGroup size="sm">
              <Button
                disabled={this.state.arquivado == true ? true : false}
                style={{ margin: "3px" }}
                onClick={this.startMembersUpdate}
              >
                <i class="material-icons">edit</i>Atualizar Membros
              </Button>

              <Button
                disabled={this.state.arquivado == true ? true : false}
                style={{ margin: "3px" }}
                onClick={this.editTitle}
              >
                <i class="material-icons">edit</i> Editar título
              </Button>
              <Button
                style={{ margin: "3px" }}
                onClick={this.props.arquiveOrReverse}
              >
                <i class="material-icons">archive</i> Arquivar / Desarquivar
              </Button>
            </ButtonGroup>
          )}
          {this.state.editingTitle ? (
            <div>
              <Button
                style={{ "margin-right": "5px" }}
                theme="success"
                onClick={this.finalizeEditTitle}
                disabled={this.state.buttonsEditDisabled}
              >
                {this.state.buttonSave}
              </Button>
              <Button
                theme="danger"
                disabled={this.state.buttonsEditDisabled}
                onClick={this.cancelEditTitle}
              >
                Cancelar
              </Button>
            </div>
          ) : this.state.updatingMembers ? (
            <div>
              <Button
                style={{ margin: "5px" }}
                theme="success"
                onClick={this.finalizeUpdatingMembers}
                disabled={this.state.buttonsEditDisabled}
              >
                {this.state.buttonSave}
              </Button>
              <Button
                theme="danger"
                disabled={this.state.buttonsEditDisabled}
                onClick={this.cancelUpdatingMembers}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            ""
          )}
        </CardFooter>
      </Card>
    );
  }
}

export default CasoDetailOverview;
