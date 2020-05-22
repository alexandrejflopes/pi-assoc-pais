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

import { addDocError, sucessoGeral } from "../../utils/messages_strings";

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
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.editTitle = this.editTitle.bind(this);
    this.handleTitleToAddChange = this.handleTitleToAddChange.bind(this);
    this.cancelEditTitle = this.cancelEditTitle.bind(this);
    this.finalizeEditTitle = this.finalizeEditTitle.bind(this);
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

    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/api/updateTituloCaso?" +
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
          ) : (
            <ButtonGroup>
              <Button style={{ margin: "3px" }}>
                <i class="material-icons">edit</i>Atualizar Membros
              </Button>
              <Button
                style={{ margin: "3px" }}
                onClick={this.props.arquiveOrReverse}
              >
                <i class="material-icons">archive</i> Arquivar/Desarquivar
              </Button>
              <Button style={{ margin: "3px" }} onClick={this.editTitle}>
                <i class="material-icons">edit</i> Editar título
              </Button>{" "}
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
          ) : (
            ""
          )}
        </CardFooter>
      </Card>
    );
  }
}

export default CasoDetailOverview;
