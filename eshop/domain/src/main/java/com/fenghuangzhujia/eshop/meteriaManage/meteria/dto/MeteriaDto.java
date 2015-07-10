package com.fenghuangzhujia.eshop.meteriaManage.meteria.dto;

import com.fenghuangzhujia.eshop.meteriaManage.product.dto.ProductVo;
import com.fenghuangzhujia.foundation.core.dto.DtoBaseModel;
import com.fenghuangzhujia.foundation.media.MediaContentDto;

public class MeteriaDto extends DtoBaseModel {

	/**排序序号*/
	private int ordernum;
	/**展示图片*/
	private MediaContentDto pic;
	/**对主材的描述信息*/
	private String description;
	/**所属产品*/
	private ProductVo product;
	
	public int getOrdernum() {
		return ordernum;
	}
	public void setOrdernum(int ordernum) {
		this.ordernum = ordernum;
	}
	public MediaContentDto getPic() {
		return pic;
	}
	public void setPic(MediaContentDto pic) {
		this.pic = pic;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public ProductVo getProduct() {
		return product;
	}
	public void setProduct(ProductVo product) {
		this.product = product;
	}
}
