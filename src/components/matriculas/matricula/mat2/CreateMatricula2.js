import Spinner from "../../../../shared/Spinner";
import IsSelect from '../../../../shared/IsSelect'
import RestResource from "../../../../service/isAdmin";
const restResourceService = new RestResource();
export default {
  name: "CreateMatricula2",
  components: {
    Spinner,IsSelect
  },
  data() {
    return {
      roles: this.$store.state.user.roles,
      tab: "init1",
      visible: 'uno',
      searchQuery: null,
      isDuplicado : false,
      listniveles: null,
      listPeriodo: null,
      isLoading: false,
      isLoading1: false,
      isLoading2: false,
      ifLoad: false,
      ifLoad1: false,
      infoMat: null,
      info : null,
      model: {
        _id: null,
        fecha: null,
        fkestudiante: null,
        fkperiodos: null,
        fknivel: null,
        nmatricula: null,
        folio: null,
        curso: null,
        estado: null,
        typo: null,
        academico: null,
        nombre : null,
      },
      result : {
        id: null,
        fullname: null,
        foto: null,
      },
      foto: null,
      isSelecUsers: [],
      fecha: '',
    };
  },
  methods: {
    verificarUsuario() {
      if (!restResourceService.admin(this.roles)) {
        this.$router.push("/");
      }
    },
    getAll() {
      this.isLoading = true;
      let modalidad = 'Extraordinaria';
      this.$proxies._matriculaProxi
        .getAllEstudiantes(modalidad) //EJECUTA LOS PROXIS QUE INYECTA AXIOS
        .then((x) => {
          this.info = x.data;
          this.isLoading = false;
         
        })
        .catch(() => {
          console.log("Error imposible");
          this.isLoading = false;
         
        });
    },

    __listNivele() {
      //-----------TRAE LA LISTA DE LOS ROLES
      this.isLoading2 = true;
      this.$proxies._gestionProxi
        .getNiveles()
        .then((x) => {
          let filtrosNiveles = x.data;

          this.listniveles = filtrosNiveles.filter((x) => x.modalidad == 'Extraordinaria');
          this.isLoading2 = false;
        })
        .catch((err) => {
          console.log("Error", err);
          this.isLoading2 = false;
          this.$router.push('/Matricula-2')
          this.$notify({
            group: "global",
            text: "Error del internet en el servidor",
          });
        });
    },
    __listPeriodo() {
      //-----------TRAE LA LISTA DE LOS ROLES
      this.isLoading1 = true;
      this.$proxies._matriculaProxi
        .getFull()
        .then((x) => {
          let filtro = x.data.niveles;
          this.listPeriodo = filtro.filter(
            (x) => x.typo == "Extraordinaria" && x.estado == "1"
          );
          this.isLoading1 = false;
        })
        .catch((err) => {
          console.log("Error", err);
          this.isLoading1 = false;
        });
    },
    save() {
      //-----------BOTTON DE GUADAR TIENE VALIDAR Y SI EL ID ES NULL ENTONCES GUARDA
      this.$validate().then((success) => {
        //METODO PARA GUARDAR
        if (!success) {
          this.$notify({
            group: "global",
            text: "Por favor llena correctamente los campos solicitados",
          });
          return;
        }

        //-----------DE LO CONTRARIO ENTRA A SER UN DOCUMENTO NUEVO
        this.ifLoad = true;
        this.model.estado = 1;
        this.model.fecha = this.fechaActual();
        this.model.academico = this.model.academico._id;
        this.model.fknivel = this.model.fknivel._id;
        this.model.typo = "m2";
        this.model.curso = "Undefined";
        this.$proxies._matriculaProxi
          .createMatricula(this.model) //-----------GUARDAR CON AXIOS
          .then(() => {
            this.ifLoad = false;
             this.regresar();
             this.$notify({
              group: "global",
              text: "Registro exitoso!!!!",
            });
          })
          .catch((error) => {
            //-----------EN CASO DE TENER DUPLICADO LOS DOCUMENTOS EL SERVIDOR LANZARA LA EXEPCION
            this.ifLoad = false;
            if (error.response) {
              if (error.response.status == 400) {
               
                this.$notify({
                  group: "global",
                  text: error.response.data.message,
                });
                this. __limpiarCampos();
                this.isDuplicado = true;
              }
            } else if (error.request) {
              alert("duplicado 2");
            } else {
              console.log("Error", error.message);
           }
          });
      });
    },
    __cambios() {
      let v = "m2";
      this.ifLoad1 = true;
      this.$proxies._matriculaProxi
        .getMatriculaFolio(v)
        .then((x) => {
          this.infoMat = x.data.infor;
          if (this.infoMat) {
            this.model.nmatricula = parseInt(this.infoMat.nmatricula) + 1;
            this.model.folio = Math.ceil(this.model.nmatricula / 2);
          } else {
            this.model.nmatricula = 1;
            this.model.folio = 1;
          }
          this.ifLoad1 = false;
        })
        .catch((err) => {
          this.ifLoad1 = false;
          console.log("Error", err);
        });
    },
    checkExist(event){
      if (event) {
        this.__cambios();
       
      }
      
    } ,
    fechaActual(){
      var date = new Date();
       const months = ["ENERO", "FEBRERO", "MARZO","ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

      const formatDate = (date)=>{
      let formatted_date = date.getDate() + " " + months[date.getMonth()] + " DEL " + date.getFullYear()
      return formatted_date;
      }
      let fecha = formatDate(date)
      return fecha;
    },
    __limpiarCampos(){
      this.model.fknivel = null;
      this.model.academico = null;
      this.model.nmatricula = null;
      this.model.folio = null;
    },
    mostrar(){
      this.visible= "dos";
    },
    regresar(){
      this.visible= "uno";
      this.isSelecUsers = [];
    },
    nextO(){
      this.__limpiarCampos()
      this.model.fkestudiante = this.isSelecUsers[0].id;
      this.model.nombre = this.isSelecUsers[0].name;
      this.foto = this.isSelecUsers[0].img;
      this.visible= "dos";
      this.isDuplicado = false;
    },
    selectUser(objeto){
      let longitud = this.isSelecUsers.length;
      let isExiste = 0;
      if(longitud>0){
         for (let i = 0; i < this.isSelecUsers.length; i++) {
            if(this.isSelecUsers[i].id==objeto._id){
             this.isSelecUsers.splice(i, 1); 
             isExiste = 1;
             break;
            }
         }
         if(isExiste===0){ 
           this.isSelecUsers.push({
            id: objeto._id,
            name: objeto.fullname,
            img: objeto.foto,
           });
         }
      }else{
       this.isSelecUsers.push({
        id: objeto._id,
        name: objeto.fullname,
        img: objeto.foto,
       });
      } 
    },
  },
  computed: {
    resultQuery(){
      if(this.searchQuery){
      return this.info.filter((item)=>{
        return this.searchQuery.toLowerCase().split(' ').every(v => item.fullname.toLowerCase().includes(v))
      })
      }
    }
  },
  created() {
    this.verificarUsuario();
    this.__listPeriodo();
    this.__listNivele();
    this.getAll();
  },

  validators: {
    //ATRIBUTOS RAPA VALIDAR LOS CAMBIOS

    "model.academico"(value) {
      return this.$validator.value(value).required();
    },
    "model.fknivel"(value) {
      return this.$validator.value(value).required();
    },
    "model.nmatricula"(value) {
      return this.$validator
        .value(value)
        .required()
        .maxLength(6);
    },
    "model.folio"(value) {
      return this.$validator
        .value(value)
        .required()
        .maxLength(6);
    },
  },
};
