include ../make_variables

dirs = build

.PHONY: $(dirs) init plan apply destroy prebuild db seed

SRC_DIR := ./deploy
DEST_DIR := ./build
TFFILES := config.tf backend.tf local.tfvars variables.tf makefile

TF_TARGS := $(patsubst %,$(DEST_DIR)/%,$(TFFILES))

prebuild:
	mkdir -p ./build

$(DEST_DIR)/%: $(SRC_DIR)/% ../make_variables
	python3 ../scripts/vreplace.py -f ../make_variables $< $@


init: prebuild $(TF_TARGS)
	$(MAKE) -C build $(MAKECMDGOALS)
	@rm -f *.instance
	@touch $(INSTANCE).instance		# Marker file to display the instance name
	
plan: $(dirs) $(TF_TARGS)
apply: $(TF_TARGS) $(dirs)
apply-y: $(TF_TARGS) $(dirs)
destroy: $(dirs)

clean:
	rm -f *.instance ct_network_variables.generated
	\rm -Rf build

$(dirs):
	$(MAKE) -C $@ $(MAKECMDGOALS)