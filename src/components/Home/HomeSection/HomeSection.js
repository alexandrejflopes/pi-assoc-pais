import React from 'react';

import assocLogo from '../../../assets/home/assoc-pais-logo.png'
import { Link } from "react-router-dom"
import { Button } from "reactstrap";

function HomeSection() {
    return (
        <div id="home">
            <section id="fh5co-home" data-section="home" data-stellar-background-ratio="0.5">
                <div class="gradient"></div>
                <div class="container">
                    <div class="text-wrap">
                        <div class="text-inner">
                            <div class="row">
                                <div class="col-md-8 col-md-offset-2">
                                    <img class="to-animate" style={{marginTop: "-200px", width: "250px", height:"250px"}} src={assocLogo}/>
                                    <h1 class="to-animate">Gestor de associações de pais</h1>
                                    <h2 class="to-animate">Cria a tua própria plataforma de gestão de associações</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="slant"></div>
            </section>
        </div>
    );
}

export default HomeSection;
