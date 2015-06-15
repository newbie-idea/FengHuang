package com.fenghuangzhujia.eshop.prudoct.packages;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fenghuangzhujia.eshop.core.user.User;
import com.fenghuangzhujia.eshop.core.user.UserRepository;
import com.fenghuangzhujia.eshop.prudoct.appoint.PackageAppoint;
import com.fenghuangzhujia.eshop.prudoct.appoint.PackageAppointValidater;
import com.fenghuangzhujia.eshop.prudoct.packages.dto.DecoratePackageDto;
import com.fenghuangzhujia.eshop.prudoct.packages.dto.DecoratePackageInputArgs;
import com.fenghuangzhujia.foundation.core.dto.DtoSpecificationService;
import com.fenghuangzhujia.foundation.core.model.PagedList;
import com.fenghuangzhujia.foundation.media.MediaService;

@Service
@Transactional
public class DecoratePackageService extends DtoSpecificationService<DecoratePackage, DecoratePackageDto, DecoratePackageInputArgs, String> {
	
	@Autowired
	private MediaService mediaService;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private PackageAppointValidater appointValidater;
	
	@Override
	public DecoratePackageRepository getRepository() {
		return (DecoratePackageRepository)super.getRepository();
	}
	
	@Autowired
	public void setDecoratePackageRepository(DecoratePackageRepository repository) {
		super.setRepository(repository);
	}
	
	/**
	 * 为获取的列表附加用户能否预约等信息
	 * @param page
	 * @param size
	 * @param userId
	 * @return
	 */
	public PagedList<DecoratePackageDto> findPage(int page, int size, String userId) {
		//如果没有用户信息，正常返回列表
		if(StringUtils.isBlank(userId))
			return findPage(page, size);
		User user=userRepository.findOne(userId);
		if(user==null) {
			return findPage(page, size);
		}
		PageRequest request=new PageRequest(page-1, size);
		Page<DecoratePackage> list=getRepository().findAll(request);
		//根据用户预约状态，加入hasAppointed和couldAppoint以及reasonForCantAppoint信息
		Page<DecoratePackageDto> result=list.map(new Converter<DecoratePackage, DecoratePackageDto>() {
			@Override
			public DecoratePackageDto convert(DecoratePackage source) {
				PackageAppoint appoint=appointValidater.getAliveAppoint(user, source);
				DecoratePackageDto dto=adapter.convert(source);
				//检测用户预约状况
				if(appoint!=null && !appoint.isUsed()) {
					dto.setHasAppointed(true);
				} else {
					dto.setHasAppointed(false);
				}
				if(appoint==null) {
					dto.setCouldAppoint(true);
				} else {
					dto.setCouldAppoint(false);
					dto.setReasonForCantAppoint("您在一个月内已经预约此套餐");
				}
				return dto;
			}
		});
		return new PagedList<>(result);
	}
}
