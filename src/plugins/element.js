import Vue from "vue";
import {
  Button,
  Pagination,
  Dialog,
  Input,
  Select,
  Option,
  Table,
  TableColumn,
  DatePicker,
  Form,
  FormItem,
  Alert,
  Upload,
  Loading,
  Divider,
  Row,
  Col,
  Aside,
  menu,
  Submenu,
  Message,
  MessageBox,
  Notification,
  MenuItem,
} from "element-ui";
Vue.use(Aside);
Vue.use(menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Input);
Vue.use(DatePicker);
Vue.use(Pagination);
Vue.use(Alert);
Vue.use(Dialog);
Vue.use(Select);
Vue.use(Option);
Vue.use(Button);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Row);
Vue.use(Col);
Vue.use(Upload);
Vue.use(Divider);
Vue.use(Loading.directive);
Vue.prototype.$loading = Loading.service;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;
Vue.prototype.$MsgBox = MessageBox;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$prompt = MessageBox.prompt;
