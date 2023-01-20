# get number parts
VNUM1=${CURRENT_VERSION_PARTS[0]}
VNUM2=${CURRENT_VERSION_PARTS[1]}
VNUM3=${CURRENT_VERSION_PARTS[2]}


if [[ $VERSION == 'major']]
then
  VNUM1=v$((VNUM1+1))
elif [[ $VERSION == 'minor']]
then
  VNUM2=$((VNUM2+1))
elif [[ $VERSION == 'patch' ]]
then
  VNUM3=$((VNUM3+1))
else
  echo "No version type or incorrect type specified"
  exit 1
fi