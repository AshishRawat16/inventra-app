import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { HttpClient } from '@angular/common/http';
import {
  NbComponentStatus,
  NbGlobalLogicalPosition,
  NbGlobalPhysicalPosition,
  NbGlobalPosition,
  NbToastrService,
  NbToastrConfig,
} from '@nebular/theme';
import { SmartTableData } from '../../../@core/data/smart-table';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './smart-table.component.html',
  styleUrls: ['./smart-table.component.scss'],
})
export class SmartTableComponent implements OnInit{
 apiUrl:string = "https://localhost:7228/";
  settings = {
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmCreate: true
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      mode: 'inline',
      confirmSave: true
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      productID: {
        title: 'Product Id',
        type: 'string',
        editable: false,
        hide: true
      },
      warehouseID:{
        title: 'Warehouse Id',
        type: 'string',
        editable: false,
        hide: true
      },
      productName: {
        title: 'Product Name',
        type: 'text',
        editable: false,
        editor:{
          type : 'list',
          config:{
            list:[]
          }
        }
      },
      category: {
        title: 'Category',
        type: 'string',
        editable: false,
        addable: false,
        editor:{
          type : 'list',
          config:{
            list:[]
          }
        }
      },
      quantity: {
        title: 'Quantity',
        type: 'number',
        editable: true
      },
      warehouseName: {
        title: 'Warehouse Name',
        type: 'string',
        editable: false,
        editor:{
          type : 'list',
          config:{
            list:[]
          }
        }
      }
    },
  };

  source: LocalDataSource = new LocalDataSource();
  config: NbToastrConfig;
  destroyByClick = true;
  duration = 4000;
  hasIcon = true;
  position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
  preventDuplicates = false;
  productList:any = [];
  categoryList:any = [];
  warehouseList:any = [];
  constructor(private service: SmartTableData, private http : HttpClient, private toastrService: NbToastrService) {
    //const data = this.service.getData();
    //this.source.load(data);
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
       const data = event.data;
      this.http.post(this.apiUrl + 'api/inventory/delete-inventory', data).subscribe(resp =>{
        this.showToast('success','Success', "Record deleted successfully." );
        this.getInventoryList();
      });
    } else {
      event.confirm.reject();
    }
  }

  onSaveConfirm(event): void {
    const updatedData = event.newData;
    if(!updatedData.quantity){
      this.showToast('warning','Warning', "Fields cannot be blank." )
      //display alert
      return;
    }
    if(!updatedData || isNaN(+updatedData.quantity) || updatedData.quantity < 0){
      this.showToast('warning','Warning', "Quantity should be numeric and non-negative" )
      //display alert
      return;
    }
    this.http.post(this.apiUrl + 'api/inventory/update-inventory', updatedData).subscribe(resp =>{
        this.showToast('success','Success', "Record updated successfully." );
        this.getInventoryList();
    });
  }

  ngOnInit(){
    this.getLookupData();
    this.getInventoryList();
  }
  getLookupData(){
    this.http.get(this.apiUrl + 'api/inventory/lookup-data').subscribe((data:any) => {
          if(data){
            this.productList = data.products;
            this.categoryList = data.categories;
            this.warehouseList = data.warehouses;
            if(data.products.length > 0){
              let dataList = data.products.map((val) => {
                let obj={};
                obj['value'] = val?.name;
                obj['title'] = val?.name;
                return obj;
              });
              this.settings.columns.productName.editor.config.list = dataList;
            }
            if(data.categories.length > 0){
              let dataList = data.categories.map((val) => {
                let obj={};
                obj['value'] = val?.name;
                obj['title'] = val?.name;
                return obj;
              });
              this.settings.columns.category.editor.config.list = dataList;
            }
            if(data.warehouses.length > 0){
              let dataList = data.warehouses.map((val) => {
                let obj={};
                obj['value'] = val?.warehousE_NAME;
                obj['title'] = val?.warehousE_NAME;
                return obj;
              });
              this.settings.columns.warehouseName.editor.config.list = dataList;
            }
            this.settings = Object.assign({}, this.settings);
          }
    });
  }
  getInventoryList(){
    this.http.get(this.apiUrl + 'api/inventory/inventory-list').subscribe((data:any) => {
          if(data){
            this.source.load(data);
          }
    });
  }
  onCreateConfirm(event): void {
    const data = event.newData;
    if(data && data.productName && data.quantity && data.warehouseName && !isNaN(+data.quantity) && data.quantity >= 0){
      data.productID = event.source.data.find((val) => val['productName'] == data.productName)?.["productID"];
      data.warehouseID = event.source.data.find((val) => val['warehouseName'] == data.warehouseName)?.["warehouseID"];
      data.description="";
      this.http.post(this.apiUrl + 'api/inventory/inventory', data).subscribe(resp =>{
        this.showToast('success','Success', "Record added successfully." );
        this.getInventoryList();
        event.confirm.resolve();
        //display toaster message
      });
    }
    else{
      this.showToast('warning','Warning', "Fields cannot be blank" )
      return;    
    }
  }
  private showToast(type: NbComponentStatus, title: string, body: string) {
      const config = {
        status: type,
        destroyByClick: this.destroyByClick,
        duration: this.duration,
        hasIcon: this.hasIcon,
        position: this.position,
        preventDuplicates: this.preventDuplicates,
      };
      const titleContent = title ? `${title}` : '';
  
      this.toastrService.show(
        body,
        titleContent,
        config);
  }
}
