class Node:
    def __init__(self, id:str, label:str, coordinates:tuple, type:str="standard"):
        """_summary_

        Args:
            id (str): node id
            label (str): name of the station
            coordinates (tuple): coords
            type (str, optional): Can be: standard, interchange, continuation, onedirection. Defaults to "standard".
        """
        self.id = id
        self.label = label
        self.coordinates = coordinates
        self.type = type