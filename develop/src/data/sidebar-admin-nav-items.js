export default function () {
  return [
    {
      title: "O meu perfil",
      htmlBefore: '<i class="material-icons">person</i>',
      to: "/profile",
    },
    {
      title: "Casos",
      htmlBefore: '<i class="material-icons">description</i>',
      to: "/casos",
    },
    {
      title: "Pedidos por Aprovar",
      htmlBefore: '<i class="material-icons">description</i>',
      to: "/approval",
    },
    {
      title: "Quotas",
      htmlBefore: '<i class="material-icons">euro</i>',
      to: "/quotas",
    },
  ];
}
