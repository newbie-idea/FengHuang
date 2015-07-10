package com.fenghuangzhujia.eshop.web.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fenghuangzhujia.eshop.meteriaManage.product.ProductService;
import com.fenghuangzhujia.eshop.meteriaManage.product.dto.ProductDto;
import com.fenghuangzhujia.eshop.meteriaManage.product.dto.ProductInputArgs;
import com.fenghuangzhujia.foundation.core.rest.RequestResult;
import com.fenghuangzhujia.foundation.core.rest.SpecificationController;

@RestController("adminProductController")
@RequestMapping("admin/product")
public class ProductController extends SpecificationController<ProductDto, ProductInputArgs> {

	@Autowired
	private ProductService service;
	@Override
	public ProductService getService() {
		return service;
	}
	
	@RequestMapping(value="order",method=RequestMethod.POST)
	public String order(String[] ids) {
		getService().reOrder(ids);
		return RequestResult.success("排序完成").toJson();
	}
}
