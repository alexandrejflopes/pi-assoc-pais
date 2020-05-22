/* eslint jsx-a11y/anchor-is-valid: 0 */

// suporte para o jQuery
/*eslint-env jquery*/

import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  FormTextarea,
  FormInput,
  Badge,
  Button,
  ButtonGroup,
} from "shards-react";
import { Redirect } from "react-router";
import {
  languageCode,
  parentsParameters,
  showToast,
  toastTypes,
} from "../utils/general_utils";
import {
  addDocTitleMissing,
  addDocLinkMissing,
  addDocError,
  addCommentMissing,
  deleteCommentError,
  sucessoGeral,
} from "../utils/messages_strings";

import PageTitle from "../components/common/PageTitle";
import {
  initCasosExemplo,
  showAvailableCasos,
} from "../firebase_scripts/casos";
import CasoDetailOverview from "../components/caso-detail/CasoDetailOverview";
import * as moment from "moment";
var dateFormat = require("dateformat");

class Casos extends React.Component {
  constructor(props) {
    super(props);

    //console.log("Props: " + JSON.stringify(props));

    var redirect = "";
    var title = "";
    var id = "";
    var username = "";
    var descricao = "";
    var data = "";
    var arquivado = false;
    var ficheiros = [];
    var comentarios = [];
    var membros = [];
    if (!props.history.location.state) {
      //Buscar id ao url
      console.log(window.location.href);
      var url = window.location.href;
      var urlParts = url.toString().split("/");
      id = urlParts[urlParts.length - 1];
    } else {
      var caso = props.history.location.state.caso;
      id = caso.id;

      title = caso.titulo;

      /*
      data = new Date(caso.data_criacao._seconds * 1000).toString();
      data = moment(data).format("DD/MM/YYYY").toString();
      username = caso.autor.nome;
      descricao = caso.descricao;
      arquivado = caso.arquivado;
      ficheiros = caso.ficheiros;
      comentarios = caso.observacoes;
      */
    }

    this.state = {
      redirect: null,
      loading: true,
      currentUsername: "",
      id: id,
      title: title,
      data: data,
      username: username,
      descricao: descricao,
      redirect: redirect,
      docs: ficheiros,
      arquivado: arquivado,
      comments: comentarios,
      membros: membros,
      addingDoc: false,
      addingComment: false,
      titleToAdd: "",
      linkToAdd: "",
      commentToAdd: "",
      descricaoToAdd: "",
      buttonSave: "Gravar",
      buttonCommentSave: "Gravar",
      buttonSaveDescription: "Gravar",
      buttonDisabled: false,
      buttonCommentDisabled: false,
      editingComment: false,
      buttonsEditDeleteDisable: false,
      commentEditingID: "",
      buttonEditDisabled: false,
      editingDescription: false,
      buttonEditDescriptionDisabled: false,
      buttonsEditDescriptionDisabled: false,
    };

    this.getCasoWithoutFiles = this.getCasoWithoutFiles.bind(this);
    this.getCaso = this.getCaso.bind(this);
    this.addDoc = this.addDoc.bind(this);
    this.addComment = this.addComment.bind(this);
    this.cancelDoc = this.cancelDoc.bind(this);
    this.cancelComment = this.cancelComment.bind(this);
    this.finalizeAddDoc = this.finalizeAddDoc.bind(this);
    this.finalizeAddComment = this.finalizeAddComment.bind(this);
    this.handleTitleToAddChange = this.handleTitleToAddChange.bind(this);
    this.handleLinkToAddChange = this.handleLinkToAddChange.bind(this);
    this.handleCommentToAddChange = this.handleCommentToAddChange.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.editComment = this.editComment.bind(this);
    this.cancelEditComment = this.cancelEditComment.bind(this);
    this.finalizeEditComment = this.finalizeEditComment.bind(this);
    this.editDescription = this.editDescription.bind(this);
    this.cancelEditDescription = this.cancelEditDescription.bind(this);
    this.finalizeEditDescription = this.finalizeEditDescription.bind(this);
    this.handleDescricaoToAddChange = this.handleDescricaoToAddChange.bind(
      this
    );
    this.arquiveOrReverse = this.arquiveOrReverse.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
  }

  componentDidMount() {
    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
    if (currentUser !== null) {
      var user = currentUser.Nome;
      //console.log("User-> " + user);
      this.setState({ currentUsername: user });

      //No get caso devemos ver se currentUsername está nos membros, se não estiver, fazer redirect para casos
    } else {
      //Redirect to login
      var redirect = (
        <Redirect
          to={{
            pathname: "/",
          }}
        />
      );
      this.setState({ redirect: redirect });
    }

    //Get caso from db
    this.getCaso();
  }

  getCaso() {
    const { id, currentUsername } = this.state;
    const this_ = this;

    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));

    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/api/getCaso?" +
      "id=" +
      id;

    const request = async () => {
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          var title = data.titulo;

          var date = new Date(data.data_criacao._seconds * 1000).toString();
          date = moment(date).format("DD/MM/YYYY").toString();
          var username = data.autor.nome;

          var descricao = data.descricao;
          var arquivado = data.arquivado;
          var ficheiros = data.ficheiros;
          var comentarios = data.observacoes;
          var membros = data.membros;

          var userInCaso = false;
          for (var i = 0; i < membros.length; i++) {
            if (
              membros[i].nome == currentUsername ||
              membros[i].nome == currentUser.Nome
            ) {
              userInCaso = true;
              break;
            }
          }

          var redirect = null;
          if (userInCaso == false) {
            redirect = (
              <Redirect
                to={{
                  pathname: "/casos",
                }}
              />
            );
          }

          this_.setState({
            redirect: redirect,
            title: title,
            data: date,
            username: username,
            descricao: descricao,
            arquivado: arquivado,
            docs: ficheiros,
            comments: comentarios,
            membros: membros,
            loading: false,
          });
        })
        .catch(function (error) {
          console.log(error);
          this_.setState({ loading: false });
        });
    };

    request();
  }

  getCasoWithoutFiles() {
    const { id } = this.state;
    const this_ = this;

    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/api/getCaso?" +
      "id=" +
      id;

    const request = async () => {
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          var title = data.titulo;

          var date = new Date(data.data_criacao._seconds * 1000).toString();
          date = moment(date).format("DD/MM/YYYY").toString();
          var username = data.autor.nome;
          var descricao = data.descricao;
          var arquivado = data.arquivado;
          var comentarios = data.observacoes;

          this_.setState({
            title: title,
            data: date,
            username: username,
            descricao: descricao,
            arquivado: arquivado,
            comments: comentarios,
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    };

    request();
  }

  handleDescricaoToAddChange(e) {
    this.setState({ descricaoToAdd: e.target.value });
  }

  handleTitleToAddChange(e) {
    this.setState({ titleToAdd: e.target.value });
  }

  handleLinkToAddChange(e) {
    this.setState({ linkToAdd: e.target.value });
  }

  handleCommentToAddChange(e) {
    this.setState({ commentToAdd: e.target.value });
  }

  addComment() {
    this.setState({ addingComment: true });
  }

  addDoc() {
    this.setState({ addingDoc: true });
  }

  cancelDoc() {
    this.setState({ titleToAdd: "", linkToAdd: "", addingDoc: false });
  }

  cancelComment() {
    this.setState({ commentToAdd: "", addingComment: false });
  }

  finalizeAddDoc() {
    const { id, titleToAdd, linkToAdd } = this.state;
    const this_ = this;

    if (id != "") {
      if (titleToAdd == "") {
        showToast(addDocTitleMissing[languageCode], 5000, toastTypes.ERROR);
      } else if (linkToAdd == "") {
        showToast(addDocLinkMissing[languageCode], 5000, toastTypes.ERROR);
      } else {
        this_.setState({ buttonSave: "A gravar...", buttonDisabled: true });
        //Guardar na base de dados
        let uri =
          "https://us-central1-associacao-pais.cloudfunctions.net/api/addAnexoCaso?" +
          "id=" +
          id +
          "&" +
          "nome_ficheiro=" +
          encodeURIComponent(titleToAdd) +
          "&" +
          "referencia=" +
          linkToAdd;

        const request = async () => {
          await fetch(uri)
            .then(function (data) {
              console.log(data);
              showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);

              var documentos = this_.state.docs;
              var novoDoc = {};
              novoDoc.referencia = linkToAdd;
              novoDoc.nome = titleToAdd;
              documentos.push(novoDoc);

              this_.setState(
                {
                  titleToAdd: "",
                  linkToAdd: "",
                  addingDoc: false,
                  docs: documentos,
                  buttonDisabled: false,
                },
                () => {
                  this_.getCasoWithoutFiles();
                }
              );
            })
            .catch(function (error) {
              console.log(error);
              showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
              this_.setState({ buttonSave: "Gravar", buttonDisabled: false });
            });
        };

        request();
      }
    }
  }

  finalizeAddComment() {
    const { id, commentToAdd } = this.state;
    const this_ = this;

    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));

    if (currentUser !== null) {
      var userID = currentUser.id;
      var username = currentUser.Nome;
      var photo = currentUser.photo;

      if (id != "") {
        if (commentToAdd == "") {
          showToast(addCommentMissing[languageCode], 5000, toastTypes.ERROR);
        } else {
          this_.setState({
            buttonCommentSave: "A gravar...",
            buttonCommentDisabled: true,
          });
          //Guardar na base de dados
          let uri =
            "https://us-central1-associacao-pais.cloudfunctions.net/api/addCommentCaso?" +
            "id=" +
            id +
            "&" +
            "user_id=" +
            userID +
            "&" +
            "user_name=" +
            username +
            "&" +
            "observacao=" +
            encodeURIComponent(commentToAdd) +
            "&photo=" +
            encodeURIComponent(photo);

          const request = async () => {
            await fetch(uri)
              .then(function (data) {
                if (data.status && data.status == 200) {
                  showToast(
                    sucessoGeral[languageCode],
                    5000,
                    toastTypes.SUCCESS
                  );

                  this_.setState(
                    {
                      commentToAdd: "",
                      buttonCommentSave: "Gravar",
                      addingComment: false,
                      buttonCommentDisabled: false,
                    },
                    () => this_.getCaso()
                  );
                } else {
                  showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
                  this_.setState({
                    buttonCommentSave: "Gravar",
                    buttonCommentDisabled: false,
                  });
                }
              })
              .catch(function (error) {
                console.log(error);
                showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
                this_.setState({
                  buttonCommentSave: "Gravar",
                  buttonCommentDisabled: false,
                });
              });
          };

          request();
        }
      }
    }
  }

  deleteComment(e) {
    const this_ = this;
    var id = e.target.id;
    console.log(e.target.id);

    var comment = this.state.comments[id];
    console.log(comment);

    if (comment === undefined) {
      showToast(deleteCommentError[languageCode], 5000, toastTypes.ERROR);
    } else {
      var idCaso = this.state.id;
      var user_id = comment.user.id;
      var seconds = comment.tempo._seconds;
      var nanoseconds = comment.tempo._nanoseconds;

      if (idCaso !== undefined) {
        let uri =
          "https://us-central1-associacao-pais.cloudfunctions.net/api/removeCommentCaso?" +
          "id=" +
          idCaso +
          "&user_id=" +
          user_id +
          "&seconds=" +
          seconds +
          "&nanoseconds=" +
          nanoseconds;

        const request = async () => {
          await fetch(uri)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
              showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);
              var comments = this_.state.comments;
              comments.splice(id, 1);
              this_.setState({ comments: comments });
            })
            .catch(function (error) {
              console.log(error);
            });
        };

        request();
      } else {
        console.log("erro com id");
      }
    }
  }

  editComment(e) {
    var id = e.target.id;

    var comment = this.state.comments[id];
    var conteudo = comment.conteudo;
    this.setState({
      editingComment: true,
      buttonsEditDeleteDisable: true,
      commentToAdd: conteudo,
      commentEditingID: id,
    });
  }

  cancelEditComment() {
    this.setState({
      editingComment: false,
      buttonsEditDeleteDisable: false,
      commentToAdd: "",
      commentEditingID: "",
    });
  }

  finalizeEditComment(e) {
    const this_ = this;
    var id = e.target.id;
    var comment = this.state.comments[id];
    var conteudo = this.state.commentToAdd;
    var idCaso = this.state.id;
    var user_id = comment.user.id;
    var seconds = comment.tempo._seconds;
    var nanoseconds = comment.tempo._nanoseconds;

    this_.setState({
      buttonCommentSave: "A gravar...",
      buttonEditDisabled: true,
    });
    //Guardar na base de dados
    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/api/editCommentCaso?" +
      "id=" +
      idCaso +
      "&" +
      "user_id=" +
      user_id +
      "&" +
      "seconds=" +
      seconds +
      "&" +
      "nanoseconds=" +
      nanoseconds +
      "&" +
      "observacao=" +
      conteudo;
    const request = async () => {
      await fetch(uri)
        .then(function (data) {
          showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);
          console.log(data.status);

          var comments = this_.state.comments;
          comments[id].conteudo = conteudo;

          this_.setState({
            commentToAdd: "",
            editingComment: false,
            buttonsEditDeleteDisable: false,
            buttonEditDisabled: false,
            commentEditingID: "",
            buttonCommentSave: "Gravar",
            comments: comments,
          });
        })
        .catch(function (error) {
          console.log(error);
          showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
          this_.setState({
            buttonCommentSave: "Gravar",
            buttonEditDisabled: false,
          });
        });
    };

    request();
  }

  editDescription(e) {
    let descricaoToAdd = this.state.descricao;

    this.setState({
      editingDescription: true,
      buttonEditDescriptionDisabled: true,
      descricaoToAdd: descricaoToAdd,
    });
  }

  cancelEditDescription(e) {
    this.setState({
      editingDescription: false,
      buttonEditDescriptionDisabled: false,
      descricaoToAdd: "",
    });
  }

  finalizeEditDescription(e) {
    const this_ = this;
    var id = this.state.id;

    var descricao = this.state.descricaoToAdd;

    this_.setState({
      buttonSaveDescription: "A gravar...",
      buttonsEditDescriptionDisabled: true,
    });
    //Guardar na base de dados
    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/api/editDescricaoCaso?" +
      "id=" +
      id +
      "&" +
      "descricao=" +
      descricao;
    const request = async () => {
      await fetch(uri)
        .then(function (data) {
          if (data.status && data.status == 200) {
            showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);
            console.log(data.status);

            this_.setState({
              descricao: descricao,
              descricaoToAdd: "",
              editingDescription: false,
              buttonEditDescriptionDisabled: false,
              buttonsEditDescriptionDisabled: false,
              buttonSaveDescription: "Gravar",
            });
          } else {
            showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
            this_.setState({
              buttonSaveDescription: "Gravar",
              buttonsEditDescriptionDisabled: false,
            });
          }
        })
        .catch(function (error) {
          console.log(error);
          showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
          this_.setState({
            buttonSaveDescription: "Gravar",
            buttonsEditDescriptionDisabled: false,
          });
        });
    };

    request();
  }

  arquiveOrReverse() {
    var { arquivado, id } = this.state;
    const this_ = this;

    var newValue = true;

    if (arquivado) {
      newValue = false;
    }

    let uri =
      "https://us-central1-associacao-pais.cloudfunctions.net/api/archiveCaso?" +
      "id=" +
      id +
      "&" +
      "arquivado=" +
      newValue;

    const request = async () => {
      await fetch(uri)
        .then(function (data) {
          if (data.status && data.status == 200) {
            showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);

            this_.setState({
              arquivado: newValue,
            });
          } else {
            showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
          }
        })
        .catch(function (error) {
          showToast(addDocError[languageCode], 5000, toastTypes.ERROR);
        });
    };
    request();
  }

  updateTitle(newTitle) {
    this.setState({ title: newTitle });
  }

  render() {
    if (this.state.loading == true) {
      return (
        <Container
          fluid
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {" "}
          <h1>A carregar...</h1>
        </Container>
      );
    } else {
      return (
        <Container fluid className="main-content-container px-4">
          <Row noGutters className="page-header py-4">
            <PageTitle title="" md="12" className="ml-sm-auto mr-sm-auto" />
          </Row>
          <Row>{this.state.redirect}</Row>
          <Row>
            <Col lg="6" style={{ "margin-bottom": "15px" }}>
              {this.state.arquivado ? (
                <CasoDetailOverview
                  title={this.state.title}
                  id={this.state.id}
                  data={this.state.data}
                  username={this.state.username}
                  arquivado={true}
                  membros={this.state.membros}
                  arquiveOrReverse={this.arquiveOrReverse}
                  updateTitle={this.updateTitle}
                />
              ) : (
                <div>
                  <CasoDetailOverview
                    id={this.state.id}
                    title={this.state.title}
                    data={this.state.data}
                    username={this.state.username}
                    arquivado={false}
                    membros={this.state.membros}
                    arquiveOrReverse={this.arquiveOrReverse}
                    updateTitle={this.updateTitle}
                  />
                </div>
              )}
            </Col>
            <Col lg="6" style={{ "margin-bottom": "15px" }}>
              <Card
                style={{ width: "100%", "margin-right": "60px" }}
                small
                className="mb-4 pt-3"
              >
                <CardHeader className="border-bottom text-center">
                  <h4 style={{ float: "left" }} className="mb-0">
                    Descrição
                  </h4>
                </CardHeader>
                <CardBody>
                  <span className="text-muted d-block mb-12">
                    {this.state.descricao}
                  </span>
                </CardBody>
                <CardFooter>
                  {this.state.buttonEditDescriptionDisabled == false ? (
                    <Button
                      theme="white"
                      id={""}
                      onClick={this.editDescription}
                    >
                      <span className="text-light">
                        <i className="material-icons">edit</i>
                      </span>{" "}
                      Edit
                    </Button>
                  ) : (
                    <div>
                      <Form className="add-new-post">
                        <FormTextarea
                          componentClass="textarea"
                          size="lg"
                          className="mb-3"
                          placeholder="Descrição"
                          type="text"
                          value={this.state.descricaoToAdd}
                          onChange={this.handleDescricaoToAddChange}
                        />
                      </Form>
                      <ButtonGroup>
                        <Button
                          theme="white"
                          id={""}
                          onClick={this.finalizeEditDescription}
                          disabled={this.state.buttonsEditDescriptionDisabled}
                        >
                          <span className="text-success">
                            <i className="material-icons">check</i>
                          </span>{" "}
                          {this.state.buttonSaveDescription}
                        </Button>
                        <Button
                          theme="white"
                          id={""}
                          onClick={this.cancelEditDescription}
                          disabled={this.state.buttonsEditDescriptionDisabled}
                        >
                          <span className="text-cancel">
                            <i className="material-icons">cancel</i>
                          </span>{" "}
                          Cancelar
                        </Button>
                      </ButtonGroup>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="6" style={{ "margin-bottom": "15px" }}>
              <Card
                small
                style={{ width: "100%", "margin-right": "60px" }}
                className="mb-12 pt-3"
              >
                <CardHeader className="border-bottom text-center">
                  <h4 style={{ float: "left" }} className="mb-0">
                    Discussão
                  </h4>
                </CardHeader>

                <CardBody className="p-0">
                  {this.state.comments.length != 0
                    ? this.state.comments.map((comment, idx) => (
                        <div
                          key={idx}
                          className="blog-comments__item d-flex p-3"
                        >
                          {/* Avatar */}
                          <div className="blog-comments__avatar mr-3">
                            <img
                              src={comment.user.photo}
                              alt={comment.user.photo}
                            />
                          </div>

                          {/* Content */}
                          <div className="blog-comments__content">
                            {/* Content :: Title */}
                            <div className="blog-comments__meta text-mutes">
                              <a className="text-secondary">
                                {comment.user.nome}
                              </a>
                              {" - "}
                              <span className="text-mutes">
                                {moment(
                                  Date(comment.tempo._seconds * 1000).toString()
                                )
                                  .format("DD/MM/YYYY")
                                  .toString()}
                              </span>
                            </div>

                            {/* Content :: Body */}
                            <p className="m-0 my-1 mb-2 text-muted">
                              {comment.conteudo}
                            </p>

                            {/* Content :: Actions */}
                            <div className="blog-comments__actions">
                              {this.state.currentUsername != "" &&
                              this.state.currentUsername ===
                                comment.user.nome ? (
                                <ButtonGroup size="sm">
                                  <Button
                                    theme="white"
                                    id={idx}
                                    onClick={this.editComment}
                                    disabled={
                                      this.state.buttonsEditDeleteDisable
                                    }
                                  >
                                    <span className="text-light">
                                      <i className="material-icons">edit</i>
                                    </span>{" "}
                                    Edit
                                  </Button>
                                  <Button
                                    theme="white"
                                    id={idx}
                                    onClick={this.deleteComment}
                                    disabled={
                                      this.state.buttonsEditDeleteDisable
                                    }
                                  >
                                    <span className="text-danger">
                                      <i className="material-icons">clear</i>
                                    </span>{" "}
                                    Delete
                                  </Button>
                                </ButtonGroup>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    : ""}
                </CardBody>
                <CardFooter>
                  {this.state.addingComment == true ||
                  this.state.editingComment == true ? (
                    <Form className="add-new-post">
                      <FormInput
                        size="lg"
                        className="mb-3"
                        placeholder="Comentário"
                        type="text"
                        value={this.state.commentToAdd}
                        onChange={this.handleCommentToAddChange}
                      />
                    </Form>
                  ) : (
                    <Button
                      disabled={this.state.arquivado == true ? true : false}
                      onClick={this.addComment}
                    >
                      <i className="material-icons">edit</i>
                      Adicionar comentário
                    </Button>
                  )}
                  {this.state.addingComment == true &&
                  this.state.editingComment == false ? (
                    <div>
                      <Button
                        style={{ "margin-right": "5px" }}
                        theme="success"
                        onClick={this.finalizeAddComment}
                        disabled={this.state.buttonCommentDisabled}
                      >
                        {this.state.buttonCommentSave}
                      </Button>
                      <Button
                        theme="danger"
                        disabled={this.state.buttonCommentDisabled}
                        onClick={this.cancelComment}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : this.state.editingComment == true ? (
                    <div>
                      <Button
                        style={{ "margin-right": "5px" }}
                        theme="success"
                        id={this.state.commentEditingID}
                        onClick={this.finalizeEditComment}
                        disabled={this.state.buttonEditDisabled}
                      >
                        {this.state.buttonCommentSave}
                      </Button>
                      <Button
                        theme="danger"
                        disabled={this.state.buttonEditDisabled}
                        onClick={this.cancelEditComment}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    ""
                  )}
                </CardFooter>
              </Card>
            </Col>
            <Col lg="6" style={{ "margin-bottom": "15px" }}>
              <Card
                small
                style={{ width: "100%", "margin-right": "60px" }}
                className="mb-12 pt-3"
              >
                <CardHeader className="border-bottom text-center">
                  <h4 style={{ float: "left" }} className="mb-0">
                    Documentos
                  </h4>
                </CardHeader>
                <CardBody>
                  <span className="text-muted d-block mb-12">
                    {this.state.docs.length != 0
                      ? this.state.docs.map((post, idx) => (
                          <Row style={{ width: "100%", "margin-left": "5px" }}>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={post.referencia}
                            >
                              {post.nome}
                            </a>
                          </Row>
                        ))
                      : "Sem documentos para mostrar"}
                  </span>
                </CardBody>
                <CardFooter>
                  {this.state.addingDoc == true ? (
                    <Form className="add-new-post">
                      <FormInput
                        size="lg"
                        className="mb-3"
                        placeholder="Título"
                        type="text"
                        value={this.state.titleToAdd}
                        onChange={this.handleTitleToAddChange}
                      />
                      <FormInput
                        size="lg"
                        className="mb-3"
                        placeholder="Link"
                        value={this.state.linkToAdd}
                        onChange={this.handleLinkToAddChange}
                      />
                    </Form>
                  ) : (
                    <Button onClick={this.addDoc}>
                      {" "}
                      <i className="material-icons">edit</i> Adicionar documento
                    </Button>
                  )}

                  {this.state.addingDoc == true ? (
                    <div>
                      <Button
                        style={{ "margin-right": "5px" }}
                        theme="success"
                        onClick={this.finalizeAddDoc}
                        disabled={this.state.buttonDisabled}
                      >
                        {this.state.buttonSave}
                      </Button>
                      <Button
                        theme="danger"
                        disabled={this.state.buttonDisabled}
                        onClick={this.cancelDoc}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    ""
                  )}
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

export default Casos;
