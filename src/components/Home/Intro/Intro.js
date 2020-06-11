import React from 'react';

function Intro() {

    return (
        <div id="intro">

            <section id="fh5co-intro">
                <div class="container">
                    <div class="row row-bottom-padded-lg">
                        <div class="fh5co-block to-animate">
                            <div class="overlay-darker"></div>
                            <div class="overlay"></div>
                            <div class="fh5co-text">
                                <i class="fh5co-intro-icon fab fa-osi"></i>
                                <h2>Grátis e open-source</h2>
                                <p>Uma forma completamente grátis de ter uma plataforma online</p>
                            </div>
                        </div>
                        <div class="fh5co-block to-animate" >
                            <div class="overlay-darker"></div>
                            <div class="overlay"></div>
                            <div class="fh5co-text">
                                <i class="fh5co-intro-icon fas fa-cogs"></i>
                                <h2>Solução configurável</h2>
                                <p>Escolhe título, logótipo e outros parâmetros para melhor customizares a tua plataforma</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-tasks"></i>
                                <h2>Gestão de casos de crianças</h2>
                                <p>Cria e comenta casos relacionados com a tua associação</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-money-bill-wave-alt"></i>
                                <h2>Registos de pagamentos</h2>
                                <p>Uma forma fácil de registar e guardar pagamentos de quotas</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-file-export"></i>
                                <h2>Exportar dados</h2>
                                <p>Possibilidade de exportar dados relacionados com pagamentos, casos ou utilizadores</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-book"></i>
                                <h2>Manual de instruções</h2>
                                <p>Documentação de tudo o que é necessário para iniciar a plataforma</p>
                            </div>
                        </div>
                        <div className="col-md-12" style={{ marginTop: "100px", textAlign: "center"}}>
                            <iframe width="800" height="480"
                                    src="https://www.youtube.com/embed/bipmQ-HEFT8">
                            </iframe>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Intro;
